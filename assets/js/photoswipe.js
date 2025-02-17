import PhotoSwipeLightBox from "./photoswipe/photoswipe-lightbox.esm.min.js";

const lightbox = new PhotoSwipeLightBox({
  gallery: ".pswp-figure",
  children: "a",
  pswpModule: () => import("./photoswipe/photoswipe.esm.min.js")
});

lightbox.on("uiRegister", function() {
  lightbox.pswp.ui.registerElement({
    name: "alt_text",
    classname: "pswp__alt-text-container",
    appendTo: "wrapper",
    onInit: (el, pswp) => {
      const textbox = document.createElement("p");
      textbox.classList.add("pswp__alt-text-container");
      el.appendChild(textbox);

      lightbox.pswp.on("change", () => {
        const currSlideElement = lightbox.pswp.currSlide.data.element;
        let caption = "";
        if (currSlideElement) {
          caption = currSlideElement.querySelector("img").getAttribute("alt");
          if (!caption) {
            textbox.style.display = "none";
          } else {
            textbox.style.display = "";
          }
        } else {
          textbox.style.display = "none";
        }
        textbox.innerHTML = caption || "";
      });

      const stopEvent = name => textbox.addEventListener(name, event => event.stopPropagation(), { passive: true });
      stopEvent("wheel");
      stopEvent("pointerdown");
      stopEvent("pointercancel");
    }
  });
});

lightbox.init();
