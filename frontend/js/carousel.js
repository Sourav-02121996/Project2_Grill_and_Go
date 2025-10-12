// Carousel functionality
let currentSlide = 0;
let autoPlayInterval;

function showSlide(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".indicator");

  // Wrap around if out of bounds
  if (index >= slides.length) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = slides.length - 1;
  } else {
    currentSlide = index;
  }

  // Remove active class from all slides and indicators
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));

  // Add active class to current slide and indicator
  slides[currentSlide].classList.add("active");
  indicators[currentSlide].classList.add("active");
}

function moveCarousel(direction) {
  showSlide(currentSlide + direction);
  resetAutoPlay();
}

function goToSlide(index) {
  showSlide(index);
  resetAutoPlay();
}

function startAutoPlay() {
  autoPlayInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000); // Change slide every 5 seconds
}

function resetAutoPlay() {
  clearInterval(autoPlayInterval);
  startAutoPlay();
}

// Initialize carousel on page load
document.addEventListener("DOMContentLoaded", function () {
  showSlide(0);
  startAutoPlay();

  // Pause on hover
  const carouselWrapper = document.querySelector(".carousel-wrapper");
  if (carouselWrapper) {
    carouselWrapper.addEventListener("mouseenter", () => {
      clearInterval(autoPlayInterval);
    });

    carouselWrapper.addEventListener("mouseleave", () => {
      startAutoPlay();
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      moveCarousel(-1);
    } else if (e.key === "ArrowRight") {
      moveCarousel(1);
    }
  });
});

window.moveCarousel = moveCarousel;
window.goToSlide = goToSlide;
