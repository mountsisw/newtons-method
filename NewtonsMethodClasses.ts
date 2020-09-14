/*!
    Newton's Method project
    Copyright 2020 Mount Si Software, LLC

    Reference classes used by project
*/

export class ComplexNumber
{
    constructor(private r: number, private i: number) {}
    public get real(): number { return this.r; }
    public get imaginary(): number { return this.i; }
    
    distance(other: ComplexNumber) : number
    {
        let diffR: number = this.r - other.r;
        let diffI: number = this.i - other.i;
        // correct for math class: return Math.sqrt(diffR * diffR + diffI * diffI);
        // however, our numbers are so small it doesn't matter
        return diffR * diffR + diffI * diffI;
    }
    
    add(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r + other.r, this.i + other.i);
    }
    
    subtract(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r - other.r, this.i - other.i);
    }
    
    multiply(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r * other.r + this.i * other.i * -1,
            this.r * other.i + this.i * other.r);
    }
    
    divide(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber((this.r * other.r + this.i * other.i) / (other.r * other.r + other.i * other.i),
            (this.i * other.r - this.r * other.i) / (other.r * other.r + other.i * other.i));
    }
    
    toString() : string
    {
        return "(" + this.r + ", " + this.i + ")";
    }
}

export abstract class Equation
{
    protected HTMLString: string = "";

    public abstract equationValue(point: ComplexNumber) : ComplexNumber
    public abstract derivativeValue(point: ComplexNumber) : ComplexNumber
    public get roots() : ComplexNumber[] { return []; }

    public get HTML() { return this.HTMLString; }
}

export class Polynomial extends Equation
{
    protected equationCoefs: number[];
    private derivativeCoefs: number[];

    // coefficients is an array of numbers used as coefficients for
    // the respective power elements of a polynomial equation.
    // coefficients are ordered in the reverse of how they would be written.
    // for x^3 - 1, the array would have values [-1, 0, 0, 1];
    // for 8x^2 + 3x - 12, the array would have values [-12, 3, 8];
    constructor(coefficients: number[])
    {
        super();

        // save off coefficients
        this.equationCoefs = coefficients;

        // make the derivative coefficients
        // if f(x) = x^3 - 1, f'(x) = 3x^2
        // [-1, 0, 0, 1] -> [0, 0, 3];
        this.derivativeCoefs = new Array(this.equationCoefs.length - 1);
        let nLoop: number;
        for (nLoop = 0; nLoop < this.derivativeCoefs.length; nLoop++)
            this.derivativeCoefs[nLoop] = this.equationCoefs[nLoop + 1] * (nLoop + 1);

        // make the HTML string
        for (nLoop = coefficients.length - 1; nLoop >= 0; nLoop--)
        {
            let coef: number = coefficients[nLoop];
            if (this.HTMLString.length == 0)
            {
                let strCoef: string = coef == 1 ? "" : coef == -1 ? "-" : String(coef);
                this.HTMLString = strCoef + this.formatExponent(nLoop);
            }
            else if (coef > 0)
                this.HTMLString += " + " + String(coef) + this.formatExponent(nLoop);
            else if (coef < 0)
                this.HTMLString += " - " + String(0 - coef) + this.formatExponent(nLoop);
        }
    }

    formatExponent(expValue: number) : string
    {
        if (expValue == 0) return "";
        if (expValue == 1) return "x";
        return "x<sup>" + expValue + "</sup>";
    }

    equationValue(point: ComplexNumber) { return this.formulaValue(this.equationCoefs, point); }
    derivativeValue(point: ComplexNumber) { return this.formulaValue(this.derivativeCoefs, point); }
    formulaValue(formula: number[], point: ComplexNumber) : ComplexNumber
    {
        let value: ComplexNumber = new ComplexNumber(formula[0], 0);
        let pointRaised: ComplexNumber = new ComplexNumber(1, 0);
        let nLoop: number;
        for (nLoop = 1; nLoop < formula.length; nLoop++)
        {
            pointRaised = pointRaised.multiply(point);
            value = value.add(pointRaised.multiply(new ComplexNumber(formula[nLoop], 0)));
        }
        return value;
    }
}

export class SimplePolynomial extends Polynomial
{
    constructor(degree: number)
    {
        if (degree < 3) return;
        let coefficients: number[] = [-1, 0, 0];
        for (let nLoop = 3; nLoop < degree; nLoop++) coefficients.push(0);
        coefficients.push(1);
        super(coefficients);
    }

    get roots() : ComplexNumber[]
    {
        // all simple polynomial equations are of the form
        // x^y - c = 0
        let roots: ComplexNumber[] = [];
        let nLoop: number, angle: number, exponent: number = this.equationCoefs.length - 1;
        let constant: number = Math.abs(this.equationCoefs[0]);
        for (nLoop = 0; nLoop < exponent; nLoop++)
        {
            angle = 2 * Math.PI * nLoop / exponent;
            roots.push(new ComplexNumber(constant * Math.cos(angle), constant * Math.sin(angle)));
        }
        return roots;
    }
}