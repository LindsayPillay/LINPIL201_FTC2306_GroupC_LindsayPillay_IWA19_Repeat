import { BOOKS_PER_PAGE, authors, genres, books } from "./data.js";

// Initialize variables
let booksPerPage = BOOKS_PER_PAGE;
let currentPage = 1;
let currentSearchPage = 1;
let currentSearchResults = [];
let theme = "night"
const day = {
  dark: "10, 10, 20",
  light: "255, 255, 255",
};

// Define day and night themes
const night = {
  dark: "255, 255, 255",
  light: "10, 10, 20",
};


/**
 * Applies the selected theme to a book element
 * @param {Element} bookElement - The book element to apply the theme to
 * @param {string} theme - The selected theme ('day' or 'night')
 */
function applyThemeToBook(bookElement, theme) {
  if (theme === "day") {
    bookElement.style.backgroundColor = "white";
  } else if (theme === "night") {
    bookElement.style.backgroundColor = "black";
  }
}

/**
 * Displays a range of books from a given list
 * @param {number} start - The start index of the range
 * @param {number} end - The end index of the range
 * @param {Array} bookList - The list of books to display
 * @param {string} theme - The selected theme ('day' or 'night')
 */
function showBooks(start, end, bookList, theme) {
    const booksContainer = document.querySelector('[data-list-items]');

    for (let i = start; i < end; i++) {
        const book = bookList[i];
        if (!book) break;

        const bookElement = document.createElement('button');
        bookElement.classList.add('preview');

        const bookInfoContainer = document.createElement('div');
        bookInfoContainer.classList.add('book-info');

        // Create a flex container for horizontal alignment
        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.alignItems = 'center';

        const imgElement = document.createElement('img');
        imgElement.classList.add('preview__image');
        imgElement.src = book.image;
        imgElement.alt = book.title;

        // Create a container for book title and author
        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');

        const titleElement = document.createElement('h3');
        titleElement.classList.add('preview__title');
        titleElement.textContent = book.title;

        const authorId = book.author;
        const authorName = authors[authorId];

        const authorElement = document.createElement('p');
        authorElement.classList.add('preview__author');
        authorElement.textContent = `Author: ${authorName}`;

        // Adjust margin-right to move the text a little further to the right
        textContainer.style.marginLeft = '20px';

        // Append image to flex container
        flexContainer.appendChild(imgElement);

        // Append title and author to text container
        textContainer.appendChild(titleElement);
        textContainer.appendChild(authorElement);

        // Append text container to flex container
        flexContainer.appendChild(textContainer);

        bookInfoContainer.appendChild(flexContainer);

        bookElement.appendChild(bookInfoContainer);

        applyThemeToBook(bookElement, theme);

        booksContainer.appendChild(bookElement);
    }
}

/**
 * Updates the "Show More" button text and disables it if no more books to show
 * @param {number} totalResults - The total number of results
 */
function updateShowMoreButton(totalResults) {
  if (currentSearchResults.length > 0) {
    const start = currentSearchPage * booksPerPage;
    const end = start + booksPerPage;
    const remainingBooks = totalResults - end;
    const showMoreButton = document.querySelector("[data-list-button]");
    showMoreButton.textContent =
      remainingBooks > 0
        ? `Show More (${remainingBooks})`
        : "No more books to show";
    showMoreButton.disabled = remainingBooks <= 0;
  } else {
    const start = currentPage * booksPerPage;
    const end = start + booksPerPage;
    const remainingBooks = totalResults - end;
    const showMoreButton = document.querySelector("[data-list-button]");
    showMoreButton.textContent =
      remainingBooks > 0
        ? `Show More (${remainingBooks})`
        : "No more books to show";
    showMoreButton.disabled = remainingBooks <= 0;
  }
}

/**
 * Loads more books when the "Show More" button is clicked
 */
function showMoreBooks() {
    if (currentSearchResults.length > 0) {
      currentSearchPage++;
      const start = (currentSearchPage - 1) * booksPerPage;
      const end = start + booksPerPage;
      showBooks(start, end, currentSearchResults, theme); // Pass theme parameter
      updateShowMoreButton(currentSearchResults.length);
    } else {
      currentPage++;
      const start = (currentPage - 1) * booksPerPage;
      const end = start + booksPerPage;
      showBooks(start, end, books, theme); // Pass theme parameter
      updateShowMoreButton(books.length);
    }
  }

// Event listener for "Show More" button click
const showMoreButton = document.querySelector("[data-list-button]");
showMoreButton.addEventListener("click", showMoreBooks);

// Initial display of the first 36 books
showBooks(0, booksPerPage, books);
updateShowMoreButton(books.length);


// Event listener for DOMContentLoaded to set up overlay functionality for summary of book
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".overlay");
  const overlayImage = overlay.querySelector(".overlay__image");
  const overlayTitle = overlay.querySelector(".overlay__title");
  const overlayBlur = document.querySelector('[data-list-blur]');
  const overlaySubtitle = overlay.querySelector(
    ".overlay__data[data-list-subtitle]"
  );
  const overlayDescription = overlay.querySelector(
    ".overlay__data[data-list-description]"
  );
  const overlayCloseButton = overlay.querySelector(
    ".overlay__button[data-list-close]"
  );

  /**
 * Opens the overlay and displays book details
 * @param {number} index - The index of the selected book
 * @param {boolean} isSearchPage - Indicates if the current page is a search result page
 */
  function openOverlay(index, isSearchPage) {
    const selectedBook = isSearchPage
      ? currentSearchResults[index]
      : books[index];
    overlayImage.src = selectedBook.image;
    overlayBlur.src = selectedBook.image;
    overlayTitle.textContent = selectedBook.title;
    overlaySubtitle.textContent = `${authors[selectedBook.author]} (${new Date(
      selectedBook.published
    ).getFullYear()})`;
    overlayDescription.textContent = selectedBook.description;
    overlay.showModal();
  }

  // Event delegation: Listen for clicks on a parent element
  document.addEventListener("click", (event) => {
    const clickedElement = event.target;
    const previewElement = clickedElement.closest(".preview");

    if (previewElement) {
      const index = Array.from(previewElement.parentElement.children).indexOf(
        previewElement
      );
      openOverlay(index, currentSearchResults.length > 0);
    }
  });

  overlayCloseButton.addEventListener("click", () => {
    overlay.close();
  });
});

// Event listener for DOMContentLoaded to set up search functionality
document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector("[data-header-search]");
  const searchOverlay = document.querySelector("[data-search-overlay]");
  const searchCancel = document.querySelector("[data-search-cancel]");
  const searchSave = document.querySelector('[form="search"]');
  const searchForm = document.querySelector("[data-search-form]");
  const searchTitleInput = document.querySelector("[data-search-title]");
  const searchGenresSelect = document.querySelector("[data-search-genres]");
  const searchAuthorsSelect = document.querySelector("[data-search-authors]");
  const searchResultsDiv = document.querySelector("[data-list-items]");

 // Function to show the search overlay
  function showSearchOverlay() {
    searchOverlay.showModal();
  }

  // Function to hide the search overlay and reset the form
  function hideSearchOverlay() {
    searchOverlay.close();
    searchForm.reset(); // Reset the search form
  }

  searchButton.addEventListener("click", showSearchOverlay);
  searchCancel.addEventListener("click", hideSearchOverlay);

  // Add options to the genres dropdown
  const genresList = document.createDocumentFragment();
  const presetGenre = "All Genres";
  searchGenresSelect.innerHTML = `<option>${presetGenre}</option>`;
  searchGenresSelect.appendChild(genresList);
  for (const [genreID, genreName] of Object.entries(genres)) {
    const genreSelect = document.createElement("option");
    genreSelect.innerText = `${genreName}`;
    genreSelect.value = genreID;
    genresList.appendChild(genreSelect);
  }
  searchGenresSelect.appendChild(genresList);

  // Add options to the authors dropdown
  const authorList = document.createDocumentFragment();
  const presetAuthor = "All Authors";
  searchAuthorsSelect.innerHTML = `<option>${presetAuthor}</option>`;
  for (const [authorId, authorName] of Object.entries(authors)) {
    const authorSelect = document.createElement("option");
    authorSelect.innerText = `${authorName}`;
    authorSelect.value = authorId;
    authorList.appendChild(authorSelect);
  }
  searchAuthorsSelect.appendChild(authorList);

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Search form submitted");

    const formData = new FormData(searchForm);
    const filter = Object.fromEntries(formData);
    currentSearchResults = [];
    for (const book of books) {
      const titleMatch =
        filter.title.trim() === "" ||
        book.title.toLowerCase().includes(filter.title.toLowerCase());
      const authorMatch =
        filter.author === "All Authors" || book.author.includes(filter.author);
      const genreMatch =
        filter.genre === "All Genres" || book.genres.includes(filter.genre);
      if (titleMatch && authorMatch && genreMatch) {
        currentSearchResults.push(book);
      }
    }

    console.log(currentSearchResults);

    const noResults = document.querySelector("[data-list-message]");
    const listButton = document.querySelector("[data-list-button]");
    const listItems = document.querySelector("[data-list-items]");

    if (currentSearchResults.length < 1) {
      noResults.classList.add("list__message_show");
    } else {
      noResults.classList.remove("list__message_show");
    }

    listButton.disabled = currentSearchResults.length <= 36;

    listItems.innerHTML = "";
    showBooks(
      0,
      Math.min(currentSearchResults.length, 36),
      currentSearchResults
    );

    hideSearchOverlay();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /**
 * Displays search results based on the user's search criteria
 * @param {Array} results - The list of search results to display
 */
  function displaySearchResults(results) {
    const searchResultsDiv = document.querySelector("[data-list-items]");
    searchResultsDiv.innerHTML = "";

    if (results.length === 0) {
      const noResultsMessage = document.createElement("p");
      noResultsMessage.textContent = "No results found.";
      searchResultsDiv.appendChild(noResultsMessage);
    } else {
      for (const result of results) {
        const bookElement = document.createElement("button");
        bookElement.classList.add("preview");

        const bookInfoContainer = document.createElement("div");
        bookInfoContainer.classList.add("book-info");

        const imgElement = document.createElement("img");
        imgElement.classList.add("preview__image");
        imgElement.src = result.image;
        imgElement.alt = result.title;

        const titleElement = document.createElement("h3");
        titleElement.classList.add("preview__title");
        titleElement.textContent = result.title;

        const authorId = result.author;
        const authorName = authors[authorId];

        const authorElement = document.createElement("p");
        authorElement.classList.add("preview__author");
        authorElement.textContent = `${authorName}`;

        bookInfoContainer.appendChild(imgElement);
        bookInfoContainer.appendChild(titleElement);
        bookInfoContainer.appendChild(authorElement);

        bookElement.appendChild(bookInfoContainer);

        searchResultsDiv.appendChild(bookElement);
      }
    }
  }
});

// Event listener for DOMContentLoaded to set up settings functionality
document.addEventListener("DOMContentLoaded", function () {
  const cssSelector = document.documentElement.style;
  const settingsButton = document.querySelector("[data-header-settings]");
  const settingsOverlay = document.querySelector("[data-settings-overlay]");
  const settingsCancel = document.querySelector("[data-settings-cancel]");
  const settingsSave = document.querySelector('[form="settings"]');
  const settingsTheme = document.querySelector("[data-settings-theme]");

  // Function to show the settings overlay
  function showSettingsOverlay() {
    settingsOverlay.showModal();
  }

  // Function to hide the settings overlay
  function hideSettingsOverlay() {
    settingsOverlay.close();
  }

  settingsButton.addEventListener("click", showSettingsOverlay);
  settingsCancel.addEventListener("click", hideSettingsOverlay);

  /**
 * Handles theme update when user changes theme selection
 * @param {Event} event - The event object
 */
  const themeUpdate = (event) => {
    event.preventDefault();
    const themeSelect =
      settingsTheme.options[settingsTheme.selectedIndex].value;
    theme = themeSelect;
    if (theme === "day") {
      cssSelector.setProperty("--color-dark", day.dark);
      cssSelector.setProperty("--color-light", day.light);
    } else if (theme === "night") {
      cssSelector.setProperty("--color-dark", night.dark);
      cssSelector.setProperty("--color-light", night.light);
    }

    // Apply theme to the existing books
    const bookElements = document.querySelectorAll(".preview");
    bookElements.forEach((bookElement) => {
      applyThemeToBook(bookElement, theme);
    });
    document.querySelector("[data-settings-overlay]").close();
  };

  // Set initial theme based on system preference
  settingsTheme.value =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "day"
      : "night";

  settingsSave.addEventListener("click", themeUpdate);
  settingsTheme.addEventListener("change", themeUpdate);
});
