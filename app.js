const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const hbs = require('hbs');

const app = express();
const PORT = 3000;

hbs.registerHelper('eq', function (v1, v2) {
    return v1 === v2;
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Load users and delivery personnel data
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
const deliveryPersonnel = users.filter(user => user.role === 'delivery');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/adminlogin', (req, res) => {
    res.render('adminlogin');
});

app.post('/adminlogin', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        req.session.user = user;
        if (user.role === 'admin') {
            res.redirect('/logistics');
        } else if (user.role === 'delivery') {
            res.redirect('/deliveries');
        }
    } else {
        res.redirect('/adminlogin');
    }
});

app.get('/logistics', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/adminlogin');
    }
    const deliveries = JSON.parse(fs.readFileSync('./data/deliveries.json', 'utf-8'));
    const deliveriesWithPersonnel = deliveries.map(delivery => {
        const assignedTo = deliveryPersonnel.find(person => person.id === delivery.assignedTo);
        return {
            ...delivery,
            assignedToName: assignedTo ? assignedTo.name : 'Not Assigned'
        };
    });
    res.render('logistics', { deliveries: deliveriesWithPersonnel, deliveryPersonnel });
});

app.post('/logistics', (req, res) => {
    const { orderNumber, customerName, phoneNumber, location, items, totalPrice, assignedTo } = req.body;
    const deliveries = JSON.parse(fs.readFileSync('./data/deliveries.json', 'utf-8'));
    const newDelivery = {
        id: deliveries.length + 1,
        orderNumber,
        customerName,
        phoneNumber,
        location,
        items: items.split(','),
        totalPrice,
        assignedTo,
        status: 'pending' // default status
    };
    deliveries.push(newDelivery);
    fs.writeFileSync('./data/deliveries.json', JSON.stringify(deliveries, null, 2));
    res.redirect('/logistics');
});

app.get('/deliveries', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'delivery') {
        return res.redirect('/adminlogin');
    }
    const deliveries = JSON.parse(fs.readFileSync('./data/deliveries.json', 'utf-8'));
    res.render('deliveries', { deliveries, session: req.session });
});

app.post('/update-delivery-status', (req, res) => {
    const { orderId, status } = req.body;
    const deliveries = JSON.parse(fs.readFileSync('./data/deliveries.json', 'utf-8'));
    const delivery = deliveries.find(d => d.id == orderId);
    if (delivery) {
        delivery.status = status;
        fs.writeFileSync('./data/deliveries.json', JSON.stringify(deliveries, null, 2));
    }
    res.redirect('/deliveries');
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/logistics'); 
        }
        res.clearCookie('connect.sid');
        res.redirect('/adminlogin');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
