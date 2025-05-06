function displayText() {
    const inputField = document.getElementById('textInput');
    const outputField = document.getElementById('outputField');
    outputField.textContent = inputField.value;
}

document.getElementById('displayButton').addEventListener('click', displayText);

// New function to fetch data from a URL
function fetchData() {
    const outputField = document.getElementById('outputField');
    const url = 'https://jsonplaceholder.typicode.com/posts/1'; // Example API endpoint

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            outputField.textContent = `Fetched Data: ${JSON.stringify(data)}`;
        })
        .catch(error => {
            outputField.textContent = `Error: ${error.message}`;
        });
}

// Add event listener for the new fetch button
// document.getElementById('fetchButton').addEventListener('click', fetchData);

function displayImages() {
    const outputField = document.getElementById('outputField');
    outputField.innerHTML = ''; // Clear previous content

    fetch('./scripts/sample.json') // Adjust the path if necessary
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            for (const [key, imageUrl] of Object.entries(data)) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = key;
                
                img.style.width = '200px'; // Adjust size as needed
                img.style.margin = '10px';
                outputField.appendChild(img);
            }
        })
        .catch(error => {
            outputField.textContent = `Error: ${error.message}`;
        });
}

let sortedData = {};

document.addEventListener('DOMContentLoaded', () => {
    fetchAndSortImages(); // Fetch and populate dropdowns on page load
});

function fetchAndSortImages() {
    fetch('./scripts/image_sources.json') // Adjust the path if necessary
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Parse and group images by brand, year, and model
            sortedData = {};

            for (const [key, imageUrl] of Object.entries(data)) {
                const [brand, model, year] = key.split('/'); // Extract brand, model, and year
                if (!sortedData[brand]) {
                    sortedData[brand] = {};
                }
                if (!sortedData[brand][year]) {
                    sortedData[brand][year] = {};
                }
                if (!sortedData[brand][year][model]) {
                    sortedData[brand][year][model] = [];
                }
                sortedData[brand][year][model].push(imageUrl);
            }

            populateDropdowns();
        })
        .catch(error => {
            console.error(`Error: ${error.message}`);
        });
}

function populateDropdowns() {
    const brandSelect = document.getElementById('brandSelect');
    const yearSelect = document.getElementById('yearSelect');
    const modelSelect = document.getElementById('modelSelect');

    // Clear existing options
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    yearSelect.innerHTML = '<option value="">Select Year</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';

    // Сортуємо бренди в алфавітному порядку
    const sortedBrands = Object.keys(sortedData).sort();

    // Populate brand dropdown
    sortedBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    // Update year dropdown when brand changes
    brandSelect.addEventListener('change', () => {
        const selectedBrand = brandSelect.value;
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        modelSelect.innerHTML = '<option value="">Select Model</option>';

        if (selectedBrand && sortedData[selectedBrand]) {
            // Сортуємо роки в алфавітному порядку
            const sortedYears = Object.keys(sortedData[selectedBrand]).sort();

            sortedYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        }
    });

    // Update model dropdown when year changes
    yearSelect.addEventListener('change', () => {
        const selectedBrand = brandSelect.value;
        const selectedYear = yearSelect.value;
        modelSelect.innerHTML = '<option value="">Select Model</option>';

        if (selectedBrand && selectedYear && sortedData[selectedBrand][selectedYear]) {
            // Сортуємо моделі в алфавітному порядку
            const sortedModels = Object.keys(sortedData[selectedBrand][selectedYear]).sort();

            sortedModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        }
    });
}

// Show the return button when sorting is applied
function displayFilteredImages() {
    const brand = document.getElementById('brandSelect').value;
    const year = document.getElementById('yearSelect').value;
    const model = document.getElementById('modelSelect').value;
    const outputField = document.getElementById('outputField');
    const returnButton = document.getElementById('returnButton');
    outputField.innerHTML = ''; // Clear previous content

    if (brand && year && model && sortedData[brand][year][model]) {
        sortedData[brand][year][model].forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `${brand} ${model} ${year}`;
            img.style.display = 'flex';
            img.style.justifyContent = 'center';
            img.style.borderRadius = '8px';
            img.style.width = '200px'; // Adjust size as needed
            img.style.margin = '10px';

            // Перевірка Intrinsic size
            img.onload = () => {
                if (img.naturalWidth === 1 && img.naturalHeight === 1) {
                    img.remove(); // Видаляємо картинку, якщо її розмір 1x1
                }
            };

            outputField.appendChild(img);
        });

        // Show the return button
        // returnButton.style.display = 'block';
    } else {
        outputField.textContent = 'No images found for the selected criteria.';
    }
}

// Event listeners
document.getElementById('sortButton').addEventListener('click', displayFilteredImages);
// document.getElementById('returnButton').addEventListener('click', resetToMainMenu);

