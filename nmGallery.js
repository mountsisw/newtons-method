// @ts-check

class NewtonsMethodGallery
{
    constructor(section, title)
    {
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
        this.title = title;
        this.titleText = document.createElement("span");
        this.titleText.innerHTML = this.title + " (working)";
        gallery.appendChild(this.titleText);
        this.imageArray = new Array();
        this.imageShown = 0;
        this.rootColors = ["red", "green", "blue", "cyan", "magenta", "yellow", "rose", "chartreuse", "azure", "spring", "violet", "orange"];
    }

    addImage(dataURL, plane, roots, maxAttempts)
    {
        this.imageArray.push({image: dataURL, plane: plane, roots: roots, maxAttempts: maxAttempts});
        if (this.imageArray.length == 1)
        {
            this.thumbnailImage.src = dataURL;
            this.thumbnailImage.onclick = this.showImage.bind(this, 1);
            this.showImage(1);
        }
        this.titleText.innerHTML = this.title + " (" + this.imageArray.length + " images)";
    }

    showImage(imageNumber)
    {
        if (imageNumber < 1 || imageNumber > this.imageArray.length) return;
        let imageInfo = this.imageArray[imageNumber - 1];
        document.getElementById("close-up").src = imageInfo.image;
        document.getElementById("equation").innerHTML = this.title + ", " +
            JSON.stringify(imageInfo.plane[0]) + " to " + JSON.stringify(imageInfo.plane[1]) + ", " +
            String(imageInfo.maxAttempts) + " iterations";

        let svg = document.getElementById("legend");
        while (svg.hasChildNodes()) svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", "0 0 " + String(imageInfo.roots.length * 100) + " 100");
        for (let nLoop = 0; nLoop < Math.min(imageInfo.roots.length, this.rootColors.length); nLoop++)
        {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", String(nLoop * 100));
            rect.setAttribute("y", "0");
            rect.setAttribute("width", "100");
            rect.setAttribute("height", "100");
            rect.setAttribute("fill", this.rootColors[nLoop]);
            rect.onmouseenter = this.showLegendDetails.bind(this, nLoop);
            rect.onmouseleave = function () {
                document.getElementById("colorScale").style.display = "none";
                document.getElementById("legend").style.display = "block";
            };
            svg.appendChild(rect);
        }
        
        document.getElementById("fractalMenu").style.display = "none";
        document.getElementById("imageViewer").style.display = "block";
        this.imageShown = imageNumber;
    }

    showLegendDetails(rootIndex)
    {
        if (this.imageShown < 1) return;
        let imageInfo = this.imageArray[this.imageShown - 1];

        let svg = document.getElementById("colorScale");
        while (svg.hasChildNodes()) svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", "0 0 " + String(imageInfo.maxAttempts * 100) + " 100");
        for (let nLoop = 0; nLoop < imageInfo.maxAttempts; nLoop++)
        {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", String(nLoop * 100));
            rect.setAttribute("y", "0");
            rect.setAttribute("width", "100");
            rect.setAttribute("height", "100");
            rect.setAttribute("fill", this.rootColors[rootIndex]);
            rect.style.opacity = String(1 - (nLoop / imageInfo.maxAttempts));
            svg.appendChild(rect);
        }
        document.getElementById("legend").style.display = "none";
        svg.style.display = "block";

        /* let root = imageInfo.roots[rootIndex];
        let rootPoint = String(root.r) + (root.i >= 0 ? " + " + String(root.i) : " - " + String(0 - root.i)) + "<emphasis>i<emphasis>";
        document.getElementById("rootPoint").innerHTML = rootPoint; */
    }

    showNextImage()
    {
        if (this.imageShown > 0)
        {
            if (this.imageShown == this.imageArray.length) this.showImage(1);
            else this.showImage(this.imageShown + 1);
        }
    }

    showPreviousImage()
    {
        if (this.imageShown > 0)
        {
            if (this.imageShown == 1) this.showImage(this.imageArray.length);
            else this.showImage(this.imageShown - 1);
        }
    }
}