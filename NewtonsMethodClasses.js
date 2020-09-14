/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC

    Reference classes used by project
*/
export class ComplexNumber {
    constructor(r, i) {
        this.r = r;
        this.i = i;
    }
    get real() { return this.r; }
    get imaginary() { return this.i; }
    distance(other) {
        let diffR = this.r - other.r;
        let diffI = this.i - other.i;
        // correct for math class: return Math.sqrt(diffR * diffR + diffI * diffI);
        // however, our numbers are so small it doesn't matter
        return diffR * diffR + diffI * diffI;
    }
    add(other) {
        return new ComplexNumber(this.r + other.r, this.i + other.i);
    }
    subtract(other) {
        return new ComplexNumber(this.r - other.r, this.i - other.i);
    }
    multiply(other) {
        return new ComplexNumber(this.r * other.r + this.i * other.i * -1, this.r * other.i + this.i * other.r);
    }
    divide(other) {
        return new ComplexNumber((this.r * other.r + this.i * other.i) / (other.r * other.r + other.i * other.i), (this.i * other.r - this.r * other.i) / (other.r * other.r + other.i * other.i));
    }
    toString() {
        return "(" + this.r + ", " + this.i + ")";
    }
}
export class Equation {
    constructor() {
        this.HTMLString = "";
    }
    get roots() { return []; }
    get HTML() { return this.HTMLString; }
}
export class Polynomial extends Equation {
    // coefficients is an array of numbers used as coefficients for
    // the respective power elements of a polynomial equation.
    // coefficients are ordered in the reverse of how they would be written.
    // for x^3 - 1, the array would have values [-1, 0, 0, 1];
    // for 8x^2 + 3x - 12, the array would have values [-12, 3, 8];
    constructor(coefficients) {
        super();
        // save off coefficients
        this.equationCoefs = coefficients;
        // make the derivative coefficients
        // if f(x) = x^3 - 1, f'(x) = 3x^2
        // [-1, 0, 0, 1] -> [0, 0, 3];
        this.derivativeCoefs = new Array(this.equationCoefs.length - 1);
        let nLoop;
        for (nLoop = 0; nLoop < this.derivativeCoefs.length; nLoop++)
            this.derivativeCoefs[nLoop] = this.equationCoefs[nLoop + 1] * (nLoop + 1);
        // make the HTML string
        for (nLoop = coefficients.length - 1; nLoop >= 0; nLoop--) {
            let coef = coefficients[nLoop];
            if (this.HTMLString.length == 0) {
                let strCoef = coef == 1 ? "" : coef == -1 ? "-" : String(coef);
                this.HTMLString = strCoef + this.formatExponent(nLoop);
            }
            else if (coef > 0)
                this.HTMLString += " + " + String(coef) + this.formatExponent(nLoop);
            else if (coef < 0)
                this.HTMLString += " - " + String(0 - coef) + this.formatExponent(nLoop);
        }
    }
    formatExponent(expValue) {
        if (expValue == 0)
            return "";
        if (expValue == 1)
            return "x";
        return "x<sup>" + expValue + "</sup>";
    }
    equationValue(point) { return this.formulaValue(this.equationCoefs, point); }
    derivativeValue(point) { return this.formulaValue(this.derivativeCoefs, point); }
    formulaValue(formula, point) {
        let value = new ComplexNumber(formula[0], 0);
        let pointRaised = new ComplexNumber(1, 0);
        let nLoop;
        for (nLoop = 1; nLoop < formula.length; nLoop++) {
            pointRaised = pointRaised.multiply(point);
            value = value.add(pointRaised.multiply(new ComplexNumber(formula[nLoop], 0)));
        }
        return value;
    }
}
export class SimplePolynomial extends Polynomial {
    constructor(degree) {
        if (degree < 3)
            return;
        let coefficients = [-1, 0, 0];
        for (let nLoop = 3; nLoop < degree; nLoop++)
            coefficients.push(0);
        coefficients.push(1);
        super(coefficients);
    }
    get roots() {
        // all simple polynomial equations are of the form
        // x^y - c = 0
        let roots = [];
        let nLoop, angle, exponent = this.equationCoefs.length - 1;
        let constant = Math.abs(this.equationCoefs[0]);
        for (nLoop = 0; nLoop < exponent; nLoop++) {
            angle = 2 * Math.PI * nLoop / exponent;
            roots.push(new ComplexNumber(constant * Math.cos(angle), constant * Math.sin(angle)));
        }
        return roots;
    }
}
