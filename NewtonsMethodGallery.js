class NewtonsMethodImageWithMetadata {
    constructor(dataURL, equation, plane, roots, maxAttempts) {
        this.dataURL = dataURL;
        this.equation = equation;
        this.plane = plane;
        this.roots = roots;
        this.maxAttempts = maxAttempts;
    }
}
export class NewtonsMethodGallery {
    constructor(section, title, viewer) {
        this.title = title;
        this.viewer = viewer;
        this.imageArray = new Array();
        this.imageShown = 0;
        let gallery = document.createElement("div");
        gallery.className = "gallery";
        section.appendChild(gallery);
        let arb = document.createElement("div");
        arb.className = "aspect-ratio-box";
        gallery.appendChild(arb);
        let galleryNumber = section.getElementsByClassName("gallery").length + 1;
        this.thumbnailImage = new Image();
        this.thumbnailImage.id = "gallery" + galleryNumber;
        this.thumbnailImage.className = "thumbnail";
        arb.appendChild(this.thumbnailImage);
        this.titleText = document.createElement("span");
        this.titleText.innerHTML = this.title + " (working)";
        gallery.appendChild(this.titleText);
    }
    addImage(dataURL, plane, roots, maxAttempts) {
        this.imageArray.push(new NewtonsMethodImageWithMetadata(dataURL, this.title, plane, roots, maxAttempts));
        if (this.imageArray.length == 1) {
            this.thumbnailImage.src = dataURL;
            this.thumbnailImage.onclick = this.showImage.bind(this, 1);
        }
        this.titleText.innerHTML = this.title + " (" + this.imageArray.length + " images)";
    }
    showNextImage() {
        if (this.imageShown > 0) {
            if (this.imageShown == this.imageArray.length)
                this.showImage(1);
            else
                this.showImage(this.imageShown + 1);
        }
    }
    showPreviousImage() {
        if (this.imageShown > 0) {
            if (this.imageShown == 1)
                this.showImage(this.imageArray.length);
            else
                this.showImage(this.imageShown - 1);
        }
    }
    showNewestImage() { return this.showImage(this.imageArray.length); }
    showImage(imageNumber) {
        if (imageNumber < 1 || imageNumber > this.imageArray.length)
            return;
        this.viewer.displayImage(this.imageArray[imageNumber - 1], this);
        this.imageShown = imageNumber;
    }
}
export class NewtonsMethodGalleryCloseup {
    constructor() {
        this.rootColors = ["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)",
            "rgb(0,255,255)", "rgb(255,0,255)", "rgb(255,255,0)",
            "rgb(255,0,127)", "rgb(127,255,0)", "rgb(0,127,255)",
            "rgb(0,255,127)", "rgb(127,0,255)", "rgb(255,127,0)"];
        this.prev = document.getElementById("prev");
        this.next = document.getElementById("next");
        this.closeup = document.getElementById("close-up");
        this.equation = document.getElementById("equation");
        this.legend = document.getElementById("legend");
    }
    displayImage(imageInfo, gallery) {
        this.closeup.src = imageInfo.dataURL;
        this.equation.innerHTML = imageInfo.equation + ", " +
            imageInfo.plane[0].toCoordinates(2) + " to " + imageInfo.plane[1].toCoordinates(2) + ", " +
            String(imageInfo.maxAttempts) + " iterations";
        while (this.legend.hasChildNodes())
            this.legend.removeChild(this.legend.firstChild);
        this.legend.setAttribute("viewBox", "0 0 " + String(imageInfo.roots.length * 100) + " 100");
        for (let nLoop = 0; nLoop < Math.min(imageInfo.roots.length, this.rootColors.length); nLoop++) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", String(nLoop * 100));
            rect.setAttribute("y", "0");
            rect.setAttribute("width", "100");
            rect.setAttribute("height", "100");
            rect.setAttribute("fill", this.rootColors[nLoop]);
            /* rect.onmouseenter = this.showLegendDetails.bind(this, nLoop);
            rect.onmouseleave = function () {
                document.getElementById("colorScale").style.display = "none";
                document.getElementById("legend").style.display = "block";
            }; */
            this.legend.appendChild(rect);
        }
        this.prev.onclick = gallery.showPreviousImage.bind(gallery);
        this.next.onclick = gallery.showNextImage.bind(gallery);
        document.getElementById("fractalMenu").style.display = "none";
        document.getElementById("imageViewer").style.display = "block";
    }
    showLegendDetails(rootIndex) {
        if (this.imageShown < 1)
            return;
        let imageInfo = this.imageArray[this.imageShown - 1];
        let maxWidth = document.getElementById("legend").clientWidth;
        let svg = document.getElementById("colorScale");
        while (svg.hasChildNodes())
            svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", "0 0 " + String(maxWidth) + " 100");
        for (let nLoop = 0; nLoop < imageInfo.maxAttempts; nLoop++) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", String(nLoop * maxWidth / imageInfo.maxAttempts));
            rect.setAttribute("y", "0");
            rect.setAttribute("width", String(maxWidth / imageInfo.maxAttempts));
            rect.setAttribute("height", "100");
            rect.setAttribute("fill", this.rootColors[rootIndex]);
            rect.style.opacity = String(1 - (nLoop / imageInfo.maxAttempts));
            svg.appendChild(rect);
        }
        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "10");
        text.setAttribute("y", "80");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "70px");
        text.setAttribute("textLength", String(maxWidth));
        text.setAttribute("lengthAdject", "spacingAndGlyphs");
        text.textContent = imageInfo.roots[rootIndex].toCoordinates(2, false);
        svg.appendChild(text);
        document.getElementById("legend").style.display = "none";
        svg.style.display = "block";
    }
}
