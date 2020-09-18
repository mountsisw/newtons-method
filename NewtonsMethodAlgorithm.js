/*!
    Newton's Method project
    Copyright 2020 Mount Si Software LLC
*/
import { ComplexNumber } from "./NewtonsMethodClasses.js";
export class NewtonsMethodResult {
    constructor(initialPoint, finalPoint, attempts, rootIndex, rootWithinTolerance) {
        this.initialPoint = initialPoint;
        this.finalPoint = finalPoint;
        this.attempts = attempts;
        this.rootIndex = rootIndex;
        this.rootWithinTolerance = rootWithinTolerance;
    }
    get toString() { return this.initialPoint.toString + "|" + this.finalPoint.toString + "|" + this.attempts + "|" + this.rootIndex; }
}
export class RootWell {
    constructor(center) {
        this.mass = center;
        this.points = 1;
    }
    get size() { return this.points; }
    addToWell(point) {
        this.points++;
        this.mass = this.mass.add(point);
    }
    get centerPoint() { return this.mass.divide(new ComplexNumber(this.points, 0)); }
}
export class NewtonsMethod {
    constructor(equation, maxAttempts) {
        this.equation = equation;
        this.maxAttempts = maxAttempts;
        this.roots = [];
        this.wells = [];
        this.tolerance = 0.00001;
        this.didNotConverge = 0;
        this.roots = equation.roots;
        this.roots.forEach(root => this.wells.push(new RootWell(root)));
    }
    get rootCount() { return this.roots.length; }
    get wellsInfo() { return this.wells; }
    getWellSize(wellIndex) { return this.wells[wellIndex].size - 1; }
    get didNotConvergeCount() { return this.didNotConverge; }
    solve(point) {
        let initialPoint = point.add(new ComplexNumber(0, 0));
        let nextPoint = this.evaluate(point);
        let iterations = 1;
        while (nextPoint.distance(point) > this.tolerance && iterations < this.maxAttempts) {
            point = nextPoint;
            nextPoint = this.evaluate(point);
            iterations++;
        }
        let rootIndex = -1;
        let distance = Number.MAX_SAFE_INTEGER;
        if (nextPoint.distance(point) <= this.tolerance) {
            let nLoop, newDistance;
            for (nLoop = 0; nLoop < this.wells.length; nLoop++) {
                newDistance = this.wells[nLoop].centerPoint.distance(nextPoint);
                if (newDistance < distance) {
                    distance = newDistance;
                    rootIndex = nLoop;
                }
            }
            if (distance <= this.tolerance)
                this.wells[rootIndex].addToWell(nextPoint);
            else
                this.wells.push(new RootWell(nextPoint));
        }
        else
            this.didNotConverge++;
        return new NewtonsMethodResult(initialPoint, nextPoint, iterations, rootIndex, distance < this.tolerance);
    }
    evaluate(point) {
        let numerator = this.equation.equationValue(point);
        let denomonator = this.equation.derivativeValue(point);
        return point.subtract(numerator.divide(denomonator));
    }
}
