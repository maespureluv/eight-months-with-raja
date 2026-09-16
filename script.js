const totalPages = 33;
const finalPage = totalPages + 1;
const landscapePages = new Set([2, 6, 8, 9, 12]);

let currentPage = 1;
let zoom = 1;
let secretNoteTimer;

const openingScreen = document.getElementById("openingScreen");
const passwordCard = document.getElementById("passwordCard");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordToggle = document.getElementById("passwordToggle");
const unlockButton = document.getElementById("unlockButton");
const passwordError = document.getElementById("passwordError");
const unlockScene = document.getElementById("unlockScene");
const beforeNoteCard = document.getElementById("beforeNoteCard");
const continueToGift = document.getElementById("continueToGift");
const openingCard = document.getElementById("openingCard");
const proposalScene = document.getElementById("proposalScene");
const proposalQuestion = document.querySelector(".proposal-question");
const proposalMusic = document.getElementById("proposalMusic");
const pageFrame = document.getElementById("pageFrame");
const pageImage = document.getElementById("pageImage");
const missingPage = document.getElementById("missingPage");
const book = document.querySelector(".book");
const pageCounter = document.getElementById("pageCounter");
const pageSlider = document.getElementById("pageSlider");
const poemAudio = document.getElementById("poemAudio");
const poemPlayer = poemAudio.querySelector("audio");
const audioHeart = document.getElementById("audioHeart");
const zoomLevel = document.getElementById("zoomLevel");
const finalScreen = document.getElementById("finalScreen");
const untilNine = document.getElementById("untilNine");
const backToPages = document.getElementById("backToPages");
const finalHeart = document.getElementById("finalHeart");
const lookCloser = document.getElementById("lookCloser");
const largePageImage = document.getElementById("largePageImage");
const closeView = document.getElementById("closeView");
const secretNote = document.getElementById("secretNote");
const readerElements = [
  document.querySelector(".page-status"),
  document.querySelector(".stage-wrap"),
  poemAudio,
  document.querySelector(".controls"),
  document.querySelector(".zoom-controls"),
];

const buttons = {
  previous: document.getElementById("previousPage"),
  next: document.getElementById("nextPage"),
  first: document.getElementById("firstPage"),
  previousSmall: document.getElementById("previousPageSmall"),
  nextSmall: document.getElementById("nextPageSmall"),
  last: document.getElementById("lastPage"),
  zoomOut: document.getElementById("zoomOut"),
  zoomIn: document.getElementById("zoomIn"),
  resetZoom: document.getElementById("resetZoom"),
};

function pageFileName(pageNumber) {
  return `pages/page-${String(pageNumber).padStart(2, "0")}.png`;
}

function setButtonStates() {
  const isFirstPage = currentPage === 1;
  const isFinalPage = currentPage === finalPage;

  buttons.previous.disabled = isFirstPage;
  buttons.previousSmall.disabled = isFirstPage;
  buttons.first.disabled = isFirstPage;
  buttons.next.disabled = isFinalPage;
  buttons.nextSmall.disabled = isFinalPage;
  buttons.last.disabled = isFinalPage;
  buttons.zoomOut.disabled = zoom <= 1;
  buttons.resetZoom.disabled = zoom === 1;
  buttons.zoomIn.disabled = zoom >= 2;
}

function applyZoom() {
  pageImage.style.width = `${zoom * 100}%`;
  pageImage.style.height = `${zoom * 100}%`;
  pageFrame.classList.toggle("is-zoomed", zoom > 1);
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  setButtonStates();
}

function changeZoom(amount) {
  zoom = Math.min(Math.max(zoom + amount, 1), 2);
  applyZoom();
}

function setReaderVisibility(isFinal) {
  readerElements.forEach((element) => {
    element.classList.toggle("reader-hidden", isFinal);
  });
  finalScreen.classList.toggle("hidden", !isFinal);
}

function updatePage(pageNumber) {
  currentPage = Math.min(Math.max(pageNumber, 1), finalPage);
  document.body.classList.toggle("page-two-active", currentPage === 2);

  if (currentPage === finalPage) {
    setReaderVisibility(true);
    pageCounter.textContent = "Final";
    setButtonStates();
    return;
  }

  const isLandscape = landscapePages.has(currentPage);
  const source = pageFileName(currentPage);

  setReaderVisibility(false);
  book.classList.toggle("portrait-mode", !isLandscape);
  book.classList.toggle("landscape-mode", isLandscape);
  book.classList.toggle("page-two-mode", currentPage === 2);
  pageFrame.classList.toggle("page-two", currentPage === 2);
  pageFrame.classList.add("is-changing");

  window.setTimeout(() => {
    pageFrame.classList.toggle("landscape", isLandscape);
    pageFrame.classList.toggle("portrait", !isLandscape);
    pageFrame.classList.remove("image-missing");

    pageImage.src = source;
    pageImage.alt = `Anniversary page ${currentPage}`;
    largePageImage.src = source;
    largePageImage.alt = `Large anniversary page ${currentPage}`;
    missingPage.innerHTML = `Add <strong>${source}</strong> here.`;

    pageCounter.textContent = `Page ${currentPage} / ${totalPages}`;
    pageSlider.value = String(currentPage);
    poemAudio.classList.toggle("hidden", currentPage !== 2);
    zoom = 1;
    applyZoom();

    setButtonStates();

    window.setTimeout(() => {
      pageFrame.classList.remove("is-changing");
    }, 80);
  }, 260);
}

pageImage.addEventListener("error", () => {
  pageFrame.classList.add("image-missing");
});

pageImage.addEventListener("load", () => {
  pageFrame.classList.remove("image-missing");
});

buttons.previous.addEventListener("click", () => updatePage(currentPage - 1));
buttons.previousSmall.addEventListener("click", () => updatePage(currentPage - 1));
buttons.next.addEventListener("click", () => updatePage(currentPage + 1));
buttons.nextSmall.addEventListener("click", () => updatePage(currentPage + 1));
buttons.first.addEventListener("click", () => updatePage(1));
buttons.last.addEventListener("click", () => updatePage(totalPages));
buttons.zoomOut.addEventListener("click", () => changeZoom(-0.25));
buttons.zoomIn.addEventListener("click", () => changeZoom(0.25));
buttons.resetZoom.addEventListener("click", () => {
  zoom = 1;
  applyZoom();
});

pageSlider.addEventListener("input", (event) => {
  updatePage(Number(event.target.value));
});

function unlockGift() {
  if (passwordInput.value.trim().toUpperCase() !== "EIGHTMONTHS") {
    passwordError.classList.remove("hidden");
    passwordCard.classList.remove("is-wrong");
    window.setTimeout(() => passwordCard.classList.add("is-wrong"), 10);
    return;
  }

  passwordError.classList.add("hidden");
  passwordCard.classList.add("is-fading");

  window.setTimeout(() => {
    passwordCard.classList.add("hidden");
    unlockScene.classList.remove("hidden");
  }, 650);

  window.setTimeout(() => {
    unlockScene.classList.add("is-unlocking");
  }, 900);

  window.setTimeout(() => {
    unlockScene.classList.add("is-fading");
  }, 6800);

  window.setTimeout(() => {
    unlockScene.classList.add("hidden");
    openingScreen.classList.add("gift-ready");
    beforeNoteCard.classList.remove("hidden");
  }, 7600);
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  unlockGift();
});

unlockButton.addEventListener("click", (event) => {
  event.preventDefault();
  unlockGift();
});

passwordToggle.addEventListener("click", () => {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  passwordToggle.classList.toggle("is-active", !isVisible);
  passwordToggle.setAttribute("aria-pressed", String(!isVisible));
  passwordToggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
});

continueToGift.addEventListener("click", () => {
  beforeNoteCard.classList.add("is-fading");

  window.setTimeout(() => {
    beforeNoteCard.classList.add("hidden");
    openingCard.classList.remove("hidden");
  }, 650);
});

document.getElementById("openGift").addEventListener("click", async (event) => {
  const button=event.currentTarget;
  if(button.disabled)return;
  button.disabled=true;
  button.textContent="Preparing your surprise…";
  try {
    await window.prepareRingModel();
    openingScreen.classList.add("proposal-mode");
    openingCard.classList.add("hidden");
    await window.startRingModel(proposalMusic,()=>{
      openingScreen.classList.add("is-opened");
      updatePage(1);
    });
  } catch(error) {
    button.disabled=false;
    button.textContent="Try loading your gift again";
    let note=document.getElementById("modelError");
    if(!note){note=document.createElement("p");note.id="modelError";button.after(note);}
    note.textContent="The 3D gift could not load. Please refresh the website and try again.";
  }
});

pageImage.addEventListener("click", () => {
  largePageImage.src = pageImage.src;
  largePageImage.alt = `Large anniversary page ${currentPage}`;
  lookCloser.showModal();
});

closeView.addEventListener("click", () => {
  lookCloser.close();
});

lookCloser.addEventListener("click", (event) => {
  if (event.target === lookCloser) {
    lookCloser.close();
  }
});

poemPlayer.addEventListener("play", () => {
  audioHeart.classList.add("is-playing");
});

poemPlayer.addEventListener("pause", () => {
  audioHeart.classList.remove("is-playing");
});

poemPlayer.addEventListener("ended", () => {
  audioHeart.classList.remove("is-playing");
});

document.querySelectorAll(".secret-heart").forEach((heart) => {
  heart.addEventListener("click", () => {
    window.clearTimeout(secretNoteTimer);
    secretNote.textContent = heart.dataset.note;
    secretNote.classList.remove("hidden");
    secretNoteTimer = window.setTimeout(() => {
      secretNote.classList.add("hidden");
    }, 2800);
  });
});

untilNine.addEventListener("click", () => {
  finalHeart.classList.remove("hidden");
});

backToPages.addEventListener("click", () => {
  updatePage(totalPages);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    updatePage(currentPage - 1);
  }

  if (event.key === "ArrowRight") {
    updatePage(currentPage + 1);
  }

  if (event.key === "Escape" && lookCloser.open) {
    lookCloser.close();
  }
});

applyZoom();
