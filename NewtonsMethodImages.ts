/*!
    Newton's Method project
    Copyright 2020 Mount Si Software LLC
*/

export class ImageCollection
{
    private imageMap: Map<number, Array<ImageInfo>> = new Map();
    private imageCount: number = 0;
    public get length(): number { return this.imageCount; }
    public get galleryCount(): number { return this.imageMap.size; }
    public getGallerySize(galleryIndex): number { return this.imageMap.get(galleryIndex).length; }

    public addImage(data: ImageData, text: string, equationIndex: number, maxIterations: number)
    {
        let info = new ImageInfo(data, text, equationIndex, maxIterations);
        if (this.imageMap.has(equationIndex) == false) this.imageMap.set(equationIndex, new Array());
        this.imageMap.get(equationIndex).push(info);
        this.imageCount++;
    }

    // incredibly inefficient but OK for small numbers and we'll change it soon
    public getImageData(imageIndex: number) : ImageInfo
    {
        for (let images of this.imageMap.values())
        {
            if (imageIndex < images.length) return images[imageIndex];
            imageIndex -= images.length;
        }
    }
}

export class ImageInfo
{
    constructor(public data: ImageData, public text: string, public equationIndex: number, public maxIterations: number) {}
}