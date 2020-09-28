/*!
    Newton's Method project
    Copyright 2020 Mount Si Software LLC

    Reference classes used by project
*/

export class ComplexNumber
{
    constructor(private r: number, private i: number) {}

    public get real(): number { return this.r; }
    public get imaginary(): number { return this.i; }    
    public get toString(): string { return "(" + this.r + ", " + this.i + ")"; }
    public toPlusMinus(decimalDigits: number = -1)
    {
        let realPart: string = decimalDigits == -1 ? this.r.toString() : this.r.toFixed(decimalDigits);
        let signPart: string = this.i < 0 ? " - " : " + ";
        let imaginaryPart: string = decimalDigits == -1 ? Math.abs(this.i).toString() : Math.abs(this.i).toFixed(decimalDigits);
        return realPart + signPart + imaginaryPart + "i";
    }
    public toCoordinates(decimalDigits: number = -1, html: boolean = true)
    {
        let realPart: string = decimalDigits == -1 ? this.r.toString() : this.r.toFixed(decimalDigits);
        let imaginaryPart: string = decimalDigits == -1 ? this.i.toString() : this.i.toFixed(decimalDigits);
        return "(" + realPart + ", " + imaginaryPart + (html ? "<i>i</i>" : "i") + ")";
    }
    
    public distance(other: ComplexNumber) : number
    {
        let diffR: number = this.r - other.r;
        let diffI: number = this.i - other.i;
        // correct for math class: return Math.sqrt(diffR * diffR + diffI * diffI);
        // however, our numbers are so small it doesn't matter
        return diffR * diffR + diffI * diffI;
    }
    
    public add(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r + other.r, this.i + other.i);
    }
    
    public subtract(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r - other.r, this.i - other.i);
    }
    
    public multiply(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber(this.r * other.r + this.i * other.i * -1,
            this.r * other.i + this.i * other.r);
    }
    
    public divide(other: ComplexNumber) : ComplexNumber
    {
        return new ComplexNumber((this.r * other.r + this.i * other.i) / (other.r * other.r + other.i * other.i),
            (this.i * other.r - this.r * other.i) / (other.r * other.r + other.i * other.i));
    }
}

export class EquationCollection
{
    private equations: Equation[] = new Array();

    constructor()
    {
        this.equations.push(new SimplePolynomial(3));
        this.equations.push(new Polynomial([2, -2, 0, 1]));
        this.equations.push(new Polynomial([-1, 0, 0, 1, 0, 0, 1]));
        this.equations.push(new Polynomial([-16, 0, 0, 0, 15, 0, 0, 0, 1]));
    }

    public get equationCount(): number { return this.equations.length; }
    public getEquation(equationNumber: number) : Equation | null
    {
        if (equationNumber < 1 || equationNumber > this.equationCount) return null;
        return this.equations[equationNumber - 1];
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
        for (nLoop = coefficients.length - 1; nLoop >= 1; nLoop--)
        {
            let coef: number = coefficients[nLoop];
            if (coef != 0)
            {
                let strCoef: string = Math.abs(coef) == 1 ? "" : String(Math.abs(coef));
                if (this.HTMLString.length == 0) this.HTMLString = (coef < 0 ? "-" : "") + strCoef + this.formatExponent(nLoop);
                else this.HTMLString += (coef > 0 ? " + " : " - ") + strCoef + this.formatExponent(nLoop);
            }
        }
        let constant = coefficients[0];
        if (this.HTMLString.length == 0) this.HTMLString = String(constant);
        else this.HTMLString += constant > 0 ? " + " + String(constant) : constant < 0 ? " - " + String(0 - constant) : "";
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
        return new Array();
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