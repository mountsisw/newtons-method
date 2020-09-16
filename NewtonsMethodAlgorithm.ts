/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC
*/

import { ComplexNumber, Equation } from "./NewtonsMethodClasses.js"

export class NewtonsMethodResult
{
    constructor(
        private initialPoint: ComplexNumber,
        private finalPoint: ComplexNumber,
        public attempts: number,
        public rootIndex: number,
        public rootWithinTolerance: boolean) {}

    public get toString() : string { return this.initialPoint.toString + "|" + this.finalPoint.toString + "|" + this.attempts + "|" + this.rootIndex; }
}

export class RootWell
{
    private mass: ComplexNumber;
    private points: number;
    public get size(): number { return this.points; }

    constructor(center: ComplexNumber)
    {
        this.mass = center;
        this.points = 1;
    }

    addToWell(point: ComplexNumber)
    {
        this.points++;
        this.mass = this.mass.add(point);
    }

    public get centerPoint(): ComplexNumber { return this.mass.divide(new ComplexNumber(this.points, 0)); }
}

export class NewtonsMethod
{
    private roots: ComplexNumber[] = [];
    public get rootCount(): number { return this.roots.length; }
    private wells: RootWell[] = [];
    public get wellsInfo(): RootWell[] { return this.wells; }
    public getWellSize(wellIndex: number): number { return this.wells[wellIndex].size - 1; }
    private tolerance: number = 0.00001;
    private didNotConverge: number = 0;
    public get didNotConvergeCount(): number { return this.didNotConverge; }

    constructor(private equation: Equation, private maxAttempts: number)
    {
        this.roots = equation.roots;
        this.roots.forEach(root => this.wells.push(new RootWell(root)));
    }
            
    solve(point: ComplexNumber): NewtonsMethodResult
    {
        let initialPoint: ComplexNumber = point.add(new ComplexNumber(0, 0));
        let nextPoint: ComplexNumber = this.evaluate(point);
        let iterations: number = 1;
        while (nextPoint.distance(point) > this.tolerance && iterations < this.maxAttempts)
        {
            point = nextPoint;
            nextPoint = this.evaluate(point);
            iterations++;
        }
        
        let rootIndex = -1;
        let distance: number = Number.MAX_SAFE_INTEGER;
        if (nextPoint.distance(point) <= this.tolerance)
        {
            let nLoop: number, newDistance: number;
            for (nLoop = 0; nLoop < this.wells.length; nLoop++)
            {
                newDistance = this.wells[nLoop].centerPoint.distance(nextPoint);
                if (newDistance < distance)
                {
                    distance = newDistance;
                    rootIndex = nLoop;
                }
            }
            if (distance <= this.tolerance) this.wells[rootIndex].addToWell(nextPoint);
            else this.wells.push(new RootWell(nextPoint));
        } else this.didNotConverge++;
        
        return new NewtonsMethodResult(initialPoint, nextPoint, iterations, rootIndex, distance < this.tolerance);
    }
    
    evaluate(point: ComplexNumber)
    {
        let numerator: ComplexNumber = this.equation.equationValue(point);
        let denomonator: ComplexNumber = this.equation.derivativeValue(point);
        return point.subtract(numerator.divide(denomonator));
    }
}