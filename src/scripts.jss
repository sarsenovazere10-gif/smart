// База данных клиник Актау с координатами
const clinics = [
    {
        id: 1,
        name: "Мангистауский областной онкологический центр",
        type: "oncology",
        address: "мкр. 1А, здание 3",
        lat: 43.6482,
        lng: 51.1543
    },
    {
        id: 2,
        name: "Медицинский центр «Erkemed»",
        type: "private",
        address: "мкр. 28/1",
        lat: 43.6321,
        lng: 51.1214
    },
    {
        id: 3,
        name: "Медицинский центр «Yassin»",
        type: "private",
        address: "мкр. 2, БЦ «Сункар», оф. 511",
        lat: 43.6515,
        lng: 51.1601
    },
    {
        id: 4,
        name: "МЦ Пасенова (Онколог-маммолог)",
        type: "oncology",
        address: "мкр. 8, здание 38",
        lat: 43.6420,
        lng: 51.1450
    },
    {
        id: 5,
        name: "Orhun Medical (Диагностика КТ/МРТ)",
        type: "private",
        address: "мкр. 12А, здание 9",
        lat: 43.6390,
        lng: 51.1320
    },
    {
        id: 6,
        name: "Мангистауская областная больница",
        type: "state",
        address: "мкр. 26, Больничный городок",
        lat: 43.6235,
        lng: 51.1090
    }
];

// Инициализация карты с центром в Актау
const map = L.map('map').setView([43.6410, 51.1415], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];

// Функция отрисовки карточек и меток
function renderClinics(data) {
    const listContainer = document.getElementById('clinicsList');
    listContainer.innerHTML = '';

    // Очищаем старые маркеры с карты
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.forEach(clinic => {
        // Создаем карточку слева
        const card = document.createElement('div');
        card.className = 'clinic-card';
        
        let badgeText = clinic.type === 'oncology' ? 'Онкология / Профильный' : 'Частный центр';
        let badgeClass = clinic.type === 'oncology' ? 'oncology' : 'private';

        card.innerHTML = `
            <h3>${clinic.name}</h3>
            <p class="address">${clinic.address}</p>
            <span class="badge ${badgeClass}">${badgeText}</span>
        `;

        // При клике на карточку карта центрируется на объекте
        card.onclick = () => {
            map.setView([clinic.lat, clinic.lng], 16);
            marker.openPopup();
        };

        listContainer.appendChild(card);

        // Создаем маркер на карте
        const marker = L.marker([clinic.lat, clinic.lng]).addTo(map);
        marker.bindPopup(`<b>${clinic.name}</b><br>${clinic.address}`);
        markers.push(marker);
    });
}

// Фильтрация по кнопкам
function filterMarkers(type) {
    // Меняем активную кнопку
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (type === 'all') {
        renderClinics(clinics);
    } else {
        const filtered = clinics.filter(c => c.type === type);
        renderClinics(filtered);
    }
}

// Первичный запуск при загрузке страницы
renderClinics(clinics);