/**********************************************************************
 * <p>Rotate a complex number around the origin.</p>
 * 
 * @module gallery-mathcanvas
 * @class Y.MathFunction.Rotate
 * @extends Y.MathFunction.FunctionWithArgs
 * @constructor
 * @param f {Y.MathFunction}
 */

function MathRotate(
	/* MathFunction */	f)
{
	MathRotate.superclass.constructor.call(this, "rotate", f);
}

Y.extend(MathRotate, MathFunctionWithArgs,
{
	evaluate: function()
	{
		return Y.ComplexMath.rotate(this.args[0].evaluate(), this.args[1].evaluate());
	}
});

MathFunction.Rotate = MathRotate;