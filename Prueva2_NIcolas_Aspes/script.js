let countriesData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 12;
let sortOrder = '=';

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("https://restcountries.com/v3.1/all");
  countriesData = await res.json();
  renderLanguageOptions();
  renderRegionOptions();
  applyFilters();
  setupEvents();
});

function setupEvents() {
  document.getElementById("languageInput").addEventListener("input", () => goToPage(1));
  document.getElementById("regionFilter").addEventListener("change", () => {
    updateSubregionOptions();
    goToPage(1);
  });
  document.getElementById("subregionFilter").addEventListener("change", () => goToPage(1));
  document.getElementById("populationBtn").addEventListener("click", toggleSortOrder);
  document.getElementById("prevBtn").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("nextBtn").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("search").addEventListener("input", showSuggestions);
}

function toggleSortOrder() {
  const btn = document.getElementById("populationBtn");
  if (sortOrder === '=') sortOrder = 'asc';
  else if (sortOrder === 'asc') sortOrder = 'desc';
  else sortOrder = '=';
  btn.textContent = sortOrder === '=' ? '=' : (sortOrder === 'asc' ? '↑' : '↓');
  goToPage(1);
}

function handleSearch() {
  goToPage(1);
}

function showSuggestions(e) {
  const input = e.target.value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";
  if (input === "") return;

  const matches = countriesData
    .filter(c => c.name.common.toLowerCase().includes(input))
    .slice(0, 10);

  matches.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c.name.common;
    li.onclick = () => {
      document.getElementById("search").value = c.name.common;
      suggestions.innerHTML = "";
    };
    suggestions.appendChild(li);
  });
}

function renderLanguageOptions() {
  const set = new Set();
  countriesData.forEach(c => {
    if (c.languages) Object.values(c.languages).forEach(lang => set.add(lang));
  });
  const datalist = document.getElementById("languageList");
  datalist.innerHTML = "";
  Array.from(set).sort().forEach(lang => {
    const option = document.createElement("option");
    option.value = lang;
    datalist.appendChild(option);
  });
}

function renderRegionOptions() {
  const set = new Set();
  countriesData.forEach(c => c.region && set.add(c.region));
  const select = document.getElementById("regionFilter");
  Array.from(set).sort().forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    select.appendChild(option);
  });
}

function updateSubregionOptions() {
  const region = document.getElementById("regionFilter").value;
  const set = new Set();
  countriesData.forEach(c => {
    if (c.region === region && c.subregion) set.add(c.subregion);
  });
  const select = document.getElementById("subregionFilter");
  select.innerHTML = "<option value=''>-----</option>";
  Array.from(set).sort().forEach(sub => {
    const option = document.createElement("option");
    option.value = sub;
    option.textContent = sub;
    select.appendChild(option);
  });
}

function applyFilters() {
  const name = document.getElementById("search").value.toLowerCase();
  const lang = document.getElementById("languageInput").value;
  const region = document.getElementById("regionFilter").value;
  const subregion = document.getElementById("subregionFilter").value;

  filteredData = countriesData.filter(c => {
    const matchesName = c.name.common.toLowerCase().includes(name);
    const matchesLang = !lang || (c.languages && Object.values(c.languages).includes(lang));
    const matchesRegion = !region || c.region === region;
    const matchesSubregion = !subregion || c.subregion === subregion;
    return matchesName && matchesLang && matchesRegion && matchesSubregion;
  });

  if (sortOrder === 'asc') {
    filteredData.sort((a, b) => a.population - b.population);
  } else if (sortOrder === 'desc') {
    filteredData.sort((a, b) => b.population - a.population);
  }

  renderCountries();
}

function goToPage(page) {
  currentPage = page;
  applyFilters();
}

function renderCountries() {
  const container = document.getElementById("countries-container");
  container.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const pageData = filteredData.slice(start, start + itemsPerPage);

  pageData.forEach(c => {
    const div = document.createElement("div");
    div.className = "col-md-2";
    div.innerHTML = `
      <div class="card h-100 p-2">
        <h5 class="card-title">
          <img src="${c.flags.svg}" alt="flag" class="country-flag me-2" />
          ${c.name.common}
        </h5>
        <div class="card-text">
          <p><strong>Capital:</strong> ${c.capital ? c.capital[0] : "N/A"}</p>
          <p><strong>Región:</strong> ${c.region}</p>
          <p><strong>Subregión:</strong> ${c.subregion || "N/A"}</p>
          <p><strong>Población:</strong> ${c.population.toLocaleString()}</p>
          <p><strong>Idiomas:</strong> ${c.languages ? Object.values(c.languages).join(", ") : "N/A"}</p>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages || totalPages === 0;
}
