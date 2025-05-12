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
    const modelSelect = document.getElementById('modelSelect');
    const yearSelect = document.getElementById('yearSelect');

    // Clear existing options
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    yearSelect.innerHTML = '<option value="">Select Year</option>';

    // Сортуємо бренди в алфавітному порядку
    const sortedBrands = Object.keys(sortedData).sort();

    // Populate brand dropdown
    sortedBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    // Update model dropdown when brand changes
    brandSelect.addEventListener('change', () => {
        const selectedBrand = brandSelect.value;
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        yearSelect.innerHTML = '<option value="">Select Year</option>';

        if (selectedBrand && sortedData[selectedBrand]) {
            // Сортуємо моделі в алфавітному порядку
            const sortedModels = Object.keys(sortedData[selectedBrand]).reduce((models, year) => {
                Object.keys(sortedData[selectedBrand][year]).forEach(model => {
                    if (!models.includes(model)) {
                        models.push(model);
                    }
                });
                return models;
            }, []).sort();

            sortedModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        }
    });

    // Update year dropdown when model changes
    modelSelect.addEventListener('change', () => {
        const selectedBrand = brandSelect.value;
        const selectedModel = modelSelect.value;
        yearSelect.innerHTML = '<option value="">Select Year</option>';

        if (selectedBrand && selectedModel) {
            // Сортуємо роки в алфавітному порядку
            const sortedYears = Object.keys(sortedData[selectedBrand]).filter(year => {
                return sortedData[selectedBrand][year][selectedModel];
            }).sort();

            sortedYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        }
    });
}

function displayFilteredImages() {
    const brand = document.getElementById('brandSelect').value;
    const year = document.getElementById('yearSelect').value;
    const model = document.getElementById('modelSelect').value;
    const outputField = document.getElementById('outputField');
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

            // Додаємо обробник подій для натискання на картинку
            img.addEventListener('click', () => {
                showImageModal(imageUrl, brand, model, year);
            });

            outputField.appendChild(img);
        });
    } else {
        outputField.textContent = 'No images found for the selected criteria.';
    }
}

// Функція для показу модального вікна з картинкою та інформацією
function showImageModal(imageUrl, brand, model, year) {
    // Отримуємо всі зображення для навігації
    const allImages = Object.values(sortedData[brand][year][model]);

    // Фільтруємо тільки ті зображення, які мають валідні розміри (не 1x1 піксель)
    const visibleImages = allImages.filter((src) => {
        const img = new Image();
        img.src = src;
        return img.naturalWidth > 1 && img.naturalHeight > 1; // Виключаємо 1x1 піксель
    });

    let currentIndex = visibleImages.indexOf(imageUrl);

    // Створюємо затемнення
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Створюємо контейнер для збільшеної картинки та інформації
    const modalContent = document.createElement('div');
    modalContent.style.position = 'relative';
    modalContent.style.textAlign = 'center';
    modalContent.style.color = 'white';

    // Створюємо збільшену картинку
    const enlargedImg = document.createElement('img');
    enlargedImg.src = imageUrl;
    enlargedImg.alt = `${brand} ${model} ${year}`;
    enlargedImg.style.width = '700px'; // Adjust size as needed
    enlargedImg.style.height = '500px';
    enlargedImg.style.borderRadius = '8px';
    enlargedImg.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';

    // Створюємо текст з інформацією
    const infoText = document.createElement('p');
    infoText.textContent = `Brand: ${brand}, Model: ${model}, Year: ${year}`;
    infoText.style.marginTop = '20px';
    infoText.style.fontSize = '18px';

    // Додаємо кнопки для навігації
    const leftArrow = document.createElement('button');
    leftArrow.textContent = '←';
    leftArrow.style.position = 'absolute';
    leftArrow.style.left = '10px';
    leftArrow.style.top = '50%';
    leftArrow.style.transform = 'translateY(-50%)';
    leftArrow.style.fontSize = '24px';
    leftArrow.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    leftArrow.style.color = 'white';
    leftArrow.style.border = 'none';
    leftArrow.style.cursor = 'pointer';
    leftArrow.style.padding = '10px';
    leftArrow.style.borderRadius = '50%';

    const rightArrow = document.createElement('button');
    rightArrow.textContent = '→';
    rightArrow.style.position = 'absolute';
    rightArrow.style.right = '10px';
    rightArrow.style.top = '50%';
    rightArrow.style.transform = 'translateY(-50%)';
    rightArrow.style.fontSize = '24px';
    rightArrow.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    rightArrow.style.color = 'white';
    rightArrow.style.border = 'none';
    rightArrow.style.cursor = 'pointer';
    rightArrow.style.padding = '10px';
    rightArrow.style.borderRadius = '50%';

    // Додаємо картинку, текст і кнопки до контейнера
    modalContent.appendChild(leftArrow);
    modalContent.appendChild(enlargedImg);
    modalContent.appendChild(rightArrow);
    modalContent.appendChild(infoText);

    // Додаємо контейнер до затемнення
    overlay.appendChild(modalContent);

    // Додаємо затемнення до документа
    document.body.appendChild(overlay);

    // Функція для оновлення картинки
    function updateImage(index) {
        enlargedImg.src = visibleImages[index];
        currentIndex = index;
    }

    // Обробники подій для кнопок
    leftArrow.addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
        updateImage(prevIndex);
    });

    rightArrow.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % visibleImages.length;
        updateImage(nextIndex);
    });

    // Обробник подій для клавіш
    function handleKeydown(event) {
        if (event.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % visibleImages.length;
            updateImage(nextIndex);
        } else if (event.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
            updateImage(prevIndex);
        } else if (event.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', handleKeydown);
        }
    }

    // Додаємо обробник подій для клавіш
    document.addEventListener('keydown', handleKeydown);

    // Закриття модального вікна при натисканні на затемнення
    overlay.addEventListener('click', (event) => {
        if (!modalContent.contains(event.target)) {
            overlay.remove();
            document.removeEventListener('keydown', handleKeydown);
        }
    });
}

// Event listeners
document.getElementById('sortButton').addEventListener('click', displayFilteredImages);
// document.getElementById('returnButton').addEventListener('click', resetToMainMenu);

