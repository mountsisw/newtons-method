/*!
    Newton's Method project
    Copyright 2020 Mount Si Software LLC
*/
export class ImageCollection {
    constructor() {
        this.imageMap = new Map();
        this.imageCount = 0;
    }
    get length() { return this.imageCount; }
    get galleryCount() { return this.imageMap.size; }
    getGallerySize(galleryIndex) { return this.imageMap.get(galleryIndex).length; }
    addImage(data, text, equationIndex, maxIterations) {
        let info = new ImageInfo(data, text, equationIndex, maxIterations);
        if (this.imageMap.has(equationIndex) == false)
            this.imageMap.set(equationIndex, new Array());
        this.imageMap.get(equationIndex).push(info);
        this.imageCount++;
    }
    // incredibly inefficient but OK for small numbers and we'll change it soon
    getImageData(imageIndex) {
        for (let images of this.imageMap.values()) {
            if (imageIndex < images.length)
                return images[imageIndex];
            imageIndex -= images.length;
        }
        return null;
    }
}
export class ImageInfo {
    constructor(data, text, equationIndex, maxIterations) {
        this.data = data;
        this.text = text;
        this.equationIndex = equationIndex;
        this.maxIterations = maxIterations;
    }
}
