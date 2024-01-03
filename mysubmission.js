const bookshelfdata = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "Book_APPS";
const bookSubmitButton = document.getElementById("bookSubmit");
let editedBookId = null;

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelfdata);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");

  function updateButtonState() {
    if (inputBookIsComplete.checked) {
      bookSubmitButton.innerHTML =
        "Masukkan Buku ke rak <span>Selesai dibaca</span>";
      bookSubmitButton.style.backgroundColor = "darkgreen";
    } else {
      bookSubmitButton.innerHTML =
        "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
      bookSubmitButton.style.backgroundColor = "#001F3F";
    }
  }
  inputBookIsComplete.addEventListener("change", updateButtonState);
  updateButtonState();
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (editedBookId !== null) {
      updateBook(editedBookId);
    } else {
      addBook();
    }
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelfdata.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
function addBook() {
  const generatedID = generateId();
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  const yearAsNumber = Number(inputBookYear, 10);
  const isCompleted = inputBookIsComplete.checked;
  const bookObject = generateBookObject(
    generatedID,
    inputBookTitle,
    inputBookAuthor,
    yearAsNumber,
    isCompleted
  );
  bookshelfdata.push(bookObject);

  clearForm();
  saveData();
}
function generateId() {
  return +new Date();
}
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}
document.addEventListener(RENDER_EVENT, function () {
  console.log(bookshelfdata);
});

function makeBook(bookObject) {
  const idBook = document.createElement("h3");
  idBook.innerText = " Kode Buku: " + bookObject.id;
  const textTitle = document.createElement("h3");
  textTitle.innerText = " Judul Buku: " + bookObject.title;

  const textAuthor = document.createElement("h3");
  textAuthor.innerText = " Penulis: " + bookObject.author;

  const textYear = document.createElement("h3");
  textYear.innerText = " Tahun : " + bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(idBook, textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("book_item");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);
  if (bookObject.isCompleted) {
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Belum Selesai dibaca";

    completeButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });
    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit";

    editButton.addEventListener("click", function () {
      editedBookId = bookObject.id;
      bookSubmitButton.innerHTML = "Edit Buku dari rak ";
      bookSubmitButton.style.backgroundColor = "darkgreen";
      fillFormWithBookData(editedBookId);
    });

    actionContainer.append(completeButton, deleteButton, editButton);
    container.append(actionContainer);
  } else {
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Selesai dibaca";

    completeButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });
    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit";

    editButton.addEventListener("click", function () {
      editedBookId = bookObject.id;
      bookSubmitButton.innerHTML = "Edit Buku dari rak ";
      bookSubmitButton.style.backgroundColor = "darkgreen";
      fillFormWithBookData(editedBookId);
    });

    actionContainer.append(completeButton, deleteButton, editButton);
    container.append(actionContainer);
  }
  return container;
}
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of bookshelfdata) {
    const bookElement = makeBook(bookItem);
    uncompletedBookList.append(bookElement);
    if (!bookItem.isCompleted) uncompletedBookList.append(bookElement);
    else completedBookList.append(bookElement);
  }
});

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) {
    return;
  }

  bookshelfdata.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) {
    return;
  }

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) {
    return;
  }

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function fillFormWithBookData(bookId) {
  const bookToEdit = findBook(bookId);

  if (bookToEdit == null) {
    return;
  }

  const inputBookTitle = document.getElementById("inputBookTitle");
  const inputBookAuthor = document.getElementById("inputBookAuthor");
  const inputBookYear = document.getElementById("inputBookYear");
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");

  inputBookTitle.value = bookToEdit.title;
  inputBookAuthor.value = bookToEdit.author;
  inputBookYear.value = bookToEdit.year;
  inputBookIsComplete.checked = bookToEdit.isCompleted;
}
function updateBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) {
    console.error("Book not found with ID:", bookId);
    return;
  }

  bookTarget.title = document.getElementById("inputBookTitle").value;
  bookTarget.author = document.getElementById("inputBookAuthor").value;
  bookTarget.year = Number(document.getElementById("inputBookYear").value);
  bookTarget.isCompleted = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  editedBookId = null;

  clearForm();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of bookshelfdata) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}
function findBookIndex(bookId) {
  for (const index in bookshelfdata) {
    if (bookshelfdata[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const searchResults = bookshelfdata.filter(function (book) {
    const lowerCaseTitle = book.title.toLowerCase();
    return lowerCaseTitle.includes(searchTitle);
  });

  displaySearchResults(searchResults);
}
function displaySearchResults(results) {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBookList = document.getElementById("completeBookshelfList");

  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  for (const bookItem of results) {
    const bookElement = makeBook(bookItem);

    if (bookItem.isCompleted) {
      completedBookList.appendChild(bookElement);
    } else {
      uncompletedBookList.appendChild(bookElement);
    }
  }
}

function showToast(message) {
  const toastElement = document.getElementById("toast");
  toastElement.textContent = message;
  toastElement.style.display = "block";
  setTimeout(() => {
    toastElement.style.display = "none";
  }, 5000);
}

document.addEventListener(SAVED_EVENT, function () {
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.innerText = "Perubahan pada Bookshelf telah disimpan.";
  toastMessage.style.display = "block";

  setTimeout(function () {
    toastMessage.style.display = "none";
  }, 5000);
});
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function clearForm() {
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
  bookSubmitButton.innerHTML =
    "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
  bookSubmitButton.style.backgroundColor = "#001F3F";
}
