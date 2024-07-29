document.addEventListener("DOMContentLoaded", function() {
    // Selectors
    const newOrderForm = document.getElementById('newOrderForm');
    const deliveriesContainer = document.getElementById('deliveries');
    const markDeliveredButtons = document.querySelectorAll('.btn-pending');

    // Event listener for new order form submission
    newOrderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Gather form data
        const customerName = document.getElementById('customerName').value;
        const items = document.getElementById('items').value.split(',').map(item => item.trim());
        const totalPrice = document.getElementById('totalPrice').value;
        const status = document.getElementById('status').value;

        // Create new order object
        const newOrder = {
            id: Date.now(),
            customerName,
            items,
            totalPrice,
            status
        };

        // Add new order to the JSON file (simulation)
        addOrder(newOrder);

        // Reset form
        newOrderForm.reset();

        // Update the UI with the new order
        renderOrder(newOrder);
    });

    // Function to add order (simulation of saving to JSON)
    function addOrder(order) {
        // This is a simulation. In a real application, you would send this data to the server.
        console.log('New Order:', order);
    }

    // Function to render order
    function renderOrder(order) {
        const orderElement = document.createElement('div');
        orderElement.classList.add('col', 'delivery-card');
        orderElement.innerHTML = `
            <h5>Order #${order.id} - ${order.customerName}</h5>
            <ul>
                <li>Items:</li>
                ${order.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <ul>
                <li>Info:</li>
                <li>Total Price: $${order.totalPrice}</li>
            </ul>
            <button type="button" class="btn btn-sm ${order.status === 'pending' ? 'btn-pending' : 'btn-delivered'}">
                ${order.status === 'pending' ? 'Mark Delivered' : 'Delivered'}
            </button>
        `;

        deliveriesContainer.appendChild(orderElement);

        // Add event listener to the new button
        const markDeliveredButton = orderElement.querySelector('.btn-pending');
        if (markDeliveredButton) {
            markDeliveredButton.addEventListener('click', () => markOrderDelivered(order.id, markDeliveredButton));
        }
    }

    // Function to mark order as delivered
    function markOrderDelivered(orderId, button) {
        // Update order status (simulation)
        console.log('Order delivered:', orderId);
        
        // Update button UI
        button.classList.remove('btn-pending');
        button.classList.add('btn-delivered');
        button.textContent = 'Delivered';
        button.disabled = true;
    }

    // Event listener for existing 'Mark Delivered' buttons
    markDeliveredButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.closest('.delivery-card').querySelector('h5').textContent.split(' ')[1].substring(1);
            markOrderDelivered(orderId, this);
        });
    });
});
