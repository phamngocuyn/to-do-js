// base Api
const apiUrl = 'https://6440b4a0fadc69b8e070cdb4.mockapi.io/products';

const productList = document.getElementById('productList');
const addForm = document.getElementById('addForm');
const addButton = document.getElementById('addButton');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const searchInput = document.getElementById('searchInput');
const pagination = document.getElementById('pagination');

const itemsPerPage = 5;
let currentPage = 1;
let totalItems = 0;
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(currentPage);
    addButton.addEventListener('click', showAddForm);
    saveButton.addEventListener('click', saveProduct);
    cancelButton.addEventListener('click', hideAddForm);
    searchInput.addEventListener('input', searchProducts);
});

async function fetchProducts(page) {
    const response = await fetch(`${apiUrl}?page=${page}&limit=${itemsPerPage}`);
    const products = await response.json();

    const countResponse = await fetch(apiUrl);
    const countData = await countResponse.json();
    totalItems = countData.length;

    renderProducts(products);
    renderPagination();
}

function renderProducts(products) {
    productList.innerHTML = '';
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.auth}</td>
            <td>$${product.price}</td>
            <td>
                <button class="edit" onclick="editProduct(${product.id})">Sửa</button>
                <button class="delete" onclick="deleteProduct(${product.id})">Xóa</button>
            </td>
        `;
        productList.appendChild(tr);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.addEventListener('click', () => {
            currentPage = i;
            fetchProducts(currentPage);
        });
        pagination.appendChild(button);
    }
}

function showAddForm() {
    addForm.classList.remove('hidden');
    addButton.classList.add('hidden');
}

function hideAddForm() {
    addForm.classList.add('hidden');
    addButton.classList.remove('hidden');
    clearForm();
}

async function saveProduct() {
    const name = document.getElementById('nameInput').value;
    const auth = document.getElementById('authInput').value;
    const price = parseFloat(document.getElementById('priceInput').value);

    if (editingProductId) {
        await fetch(`${apiUrl}/${editingProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, auth, price }),
        });
    } else {
        await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, auth, price }),
        });
    }

    fetchProducts(currentPage);
    hideAddForm();
}

function clearForm() {
    document.getElementById('nameInput').value = '';
    document.getElementById('authInput').value = '';
    document.getElementById('priceInput').value = '';
    editingProductId = null;
}

async function editProduct(id) {
    console.log("id sản phẩm", id)
    await fetch(`${apiUrl}/${id}`)
        .then(response => response.json())
        .then(product => {
            console.log("chi tiết sản phẩm:", product)
            document.getElementById('nameInput').value = product.name;
            document.getElementById('authInput').value = product.auth;
            document.getElementById('priceInput').value = product.price;
            editingProductId = id;
            showAddForm();
        });
}

async function deleteProduct(id) {
    console.log("id sản phẩm", id)
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
    });
    fetchProducts(currentPage);
}

function searchProducts() {
    const query = searchInput.value.toLowerCase();
    fetchProducts(currentPage).then(() => {
        const rows = document.querySelectorAll('#productList tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}
