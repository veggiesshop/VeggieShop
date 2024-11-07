        //FIREBASE SDKs
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
        import { getFirestore, collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAZdQ2owWNs5GScoFTkJb-V6VPCz9KhMzw",
            authDomain: "veggies-shop-79734.firebaseapp.com",
            projectId: "veggies-shop-79734",
            storageBucket: "veggies-shop-79734.appspot.com",
            messagingSenderId: "447883509262",
            appId: "1:447883509262:web:bb38c3a58b41e8b736465f"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);

        // Get references to DOM elements
        const productsList = document.getElementById('productsList');
        const editModal = document.getElementById('editModal');
        const closeModalBtn = document.querySelector('.close-btn');
        const editProductForm = document.getElementById('editProductForm');
        const selectButton = document.getElementById('openModalBtn2');
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        let isSelecting = false; // Track the state if the user is selecting products
        const searchInput = document.getElementById('searchUsername');

        let productsData = []; // Array to hold fetched products

        deleteSelectedBtn.classList.add('hidden');  // Ensure it's hidden on page load

        // Add an event listener to the search input
        searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.toLowerCase(); // Convert input to lowercase for case-insensitive search
        const filteredProducts = productsData.filter(product => 
            product.productName.toLowerCase().includes(searchQuery)
        );
        
        // Re-render the filtered products
        renderProducts(filteredProducts);
        });

        selectButton.addEventListener('click', () => {
            isSelecting = !isSelecting;  // Toggle selection mode

            // Show or hide checkboxes based on selection mode
            toggleProductSelection(isSelecting);

            // Toggle the visibility of the "Delete Selected" button
            deleteSelectedBtn.classList.toggle('hidden', !isSelecting);
        });

        //Function to render checkboxes when in selection mode
        const toggleProductSelection = (selecting) => {
            const productItems = document.querySelectorAll('.product-item');

            productItems.forEach((productItem) => {
                let checkbox = productItem.querySelector('.select-checkbox');
                
                // If in selecting mode and checkbox doesn't exist, create it
                if (selecting) {
                    if (!checkbox) {
                        checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.classList.add('select-checkbox');
                        productItem.appendChild(checkbox);
                    }
                    checkbox.style.display = 'block';  // Show the checkbox
                } else {
                    if (checkbox) {
                        checkbox.style.display = 'none';  // Hide the checkbox
                        checkbox.checked = false;  // Uncheck all checkboxes when exiting selection mode
                    }
                }
            });
        };

        // Function to handle product deletion
    deleteSelectedBtn.addEventListener('click', async () => {
        const selectedCheckboxes = document.querySelectorAll('.select-checkbox:checked');

        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one product to delete.');
            return;
        }

        const confirmDelete = confirm('Are you sure you want to delete the selected products?');
        if (!confirmDelete) return;

        for (const checkbox of selectedCheckboxes) {
            const productId = checkbox.parentElement.getAttribute('data-id');

            if (productId) {
                // Delete the product document from Firestore
                const productRef = doc(db, 'Crops', productId);
                await deleteDoc(productRef); // Ensure only specific document is deleted
            }
        }

        // Refresh the product list
        fetchProducts();

        // Exit selection mode after deletion
        isSelecting = false;
        toggleProductSelection(isSelecting);
        deleteSelectedBtn.classList.add('hidden');  // Hide the delete button after deletion
    });

        // Function to open the modal
        const openModal = (product) => {
            document.getElementById('productName').value = product.productName;
            document.getElementById('productQuantity').value = product.productQuantity;
            document.getElementById('productPrice').value = product.productPrice;
            document.getElementById('productDescription').value = product.productDescription;
            document.getElementById('editProductId').value = product.id;
            editModal.style.display = 'flex';
        };

        // Close modal functionality
        closeModalBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });

    // Function to render products
    const renderProducts = (products) => {
        // Clear the list before rendering
        productsList.innerHTML = ''; 

        // Loop through the products array and render each product
        products.forEach((product) => {
            // Create a product item element and set its class
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');

            // Set the hidden document ID using a data attribute
            productItem.setAttribute('data-id', product.id);

            // Fetch product image URL from Firebase Storage
            let imageUrl = product.imageUrl || '';

            // Structure product's info and button in a flex row
            productItem.innerHTML = `
                <div class="product-info">
                    <img src="${imageUrl}" alt="${product.productName}" class="product-image" width="50" height="50">
                    <p><strong>Product Name:</strong> ${product.productName}</p>
                    <p><strong>Description:</strong> ${product.productDescription}</p>
                    <p><strong>Available Stock:</strong> ${product.productQuantity}</p>
                    <p><strong>Price:</strong> ₱${product.productPrice}</p>
                </div>
                <button class="edit-btn" data-id="${product.id}">
                    Edit
                </button>
            `;

            productsList.appendChild(productItem);
        });

        // Add click event listener for each edit button
        document.querySelectorAll('.edit-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                const productToEdit = productsData.find(product => product.id === productId);
                if (productToEdit) {
                    openModal(productToEdit);
                }
            });
        });
    };

        // Function to fetch products from Firestore and store them in productsData array
    const fetchProducts = () => {
        const productsCollection = collection(db, "Crops");
        const q = query(productsCollection);

        onSnapshot(q, (snapshot) => {
            // Store the products in the array, ensuring no duplicates
            productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            renderProducts(productsData); // Re-render products with updated list
        });
    };

        // Function to handle the product edit form submission
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const productId = document.getElementById('editProductId').value;
            const newProductName = document.getElementById('productName').value;
            const newProductPrice = document.getElementById('productPrice').value;
            const newProductDescrription = document.getElementById('productDescription').value;
            const newProductQuantity = document.getElementById('productQuantity').value;
            const newProductImageFile = document.getElementById('productImage').files[0];

            // Update the product document in Firestore
            const productRef = doc(db, 'Crops', productId);
            let updatedData = {
                productName: newProductName,
                productPrice: parseFloat(newProductPrice),
                productDescription: newProductDescrription,
                productQuantity: newProductQuantity,
            };

            // If a new image is uploaded, upload it to Firebase Storage and get the new URL
            if (newProductImageFile) {
                const imageRef = ref(storage, `products/${newProductImageFile.name}`);
                await uploadBytes(imageRef, newProductImageFile);
                const newImageUrl = await getDownloadURL(imageRef);
                updatedData.imageUrl = newImageUrl;
            }

            await updateDoc(productRef, updatedData);

            // Close the modal
            editModal.style.display = 'none';
        });

        // Initial fetch to display all products
        fetchProducts();