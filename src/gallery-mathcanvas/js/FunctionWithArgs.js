/**********************************************************************
 * <p>Function that takes one or more arguments.</p>
 * 
 * @module gallery-mathcanvas
 * @namespace MathFunction
 * @class FunctionWithArgs
 * @extends MathFunction
 * @constructor
 * @param name {String} the name of the function
 * @param args {MathFunction|Array} the arguments
 */

function MathFunctionWithArgs(
	/* string */		name,
	/* MathFunction */	args)
{
	MathFunctionWithArgs.superclass.constructor.call(this);
	this.name = name;

	if (Y.Lang.isArray(args) && Y.Lang.isArray(args[0]))
	{
		args = args[0];
	}

	if (Y.Lang.isArray(args))
	{
		this.args = Y.Array(args);
	}
	else
	{
		this.args = [];
		for (var i=1; i<arguments.length; i++)
		{
			this.args.push(arguments[i]);
		}
	}
}

Y.extend(MathFunctionWithArgs, MathFunction,
{
	/**
	 * @param f {MathFunction}
	 */
	appendArg: function(
		/* MathFunction */	f)
	{
		this.args.push(f);
	},

	/**
	 * If origArg is an argument, replaces origArg with newArg.
	 * 
	 * @param origArg {MathFunction} original argument
	 * @param newArg {MathFunction} new argument
	 */
	replaceArg: function(
		/* MathFunction */	origArg,
		/* MathFunction */	newArg)
	{
		var i = Y.Array.indexOf(this.args, origArg);
		if (i >= 0)
		{
			this.args[i] = newArg;
		}
	},

	/**
	 * @param var_list {Object} map of variable names to values or MathFunctions
	 * @return list of argument values, from calling evaluate()
	 * @protected
	 */
	evaluateArgs: function(
		/* map */	var_list)
	{
		var v = [];
		Y.Array.each(this.args, function(arg)
		{
			v.push(arg.evaluate(var_list));
		});

		return v;
	},

	prepareToRender: function(
		/* Context2d */		context,
		/* point */			top_left,
		/* percentage */	font_size,
		/* RectList */		rect_list)
	{
		var r =
		{
			top:    top_left.y,
			left:   top_left.x,
			bottom: top_left.y + context.getLineHeight(font_size),
			right:  top_left.x + context.getStringWidth(font_size, this.name)
		};

		var midline = RectList.ycenter(r);

		// get rectangle for each argument

		var orig_midline = midline;

		var arg_top_left = { x: r.right, y: r.top };
		var sep_width    = context.getStringWidth(font_size, ', ');
		var arg_count    = this.args.length;

		var arg_i = [];
		for (var i=0; i<arg_count; i++)
		{
			var j     = this.args[i].prepareToRender(context, arg_top_left, font_size, rect_list);
			var info  = rect_list.get(j);
			var arg_r = info.rect;

			arg_top_left.x = arg_r.right + sep_width;
			r              = RectList.cover(r, arg_r);

			midline = Math.max(midline, info.midline);
			arg_i.push(j);
		}

		// adjust the argument rectangles so all the midlines are the same
		// (our midline is guaranteed to stay constant)

		if (arg_count > 1 && midline > orig_midline)
		{
			for (var i=0; i<arg_count; i++)
			{
				var j = arg_i[i];
				rect_list.setMidline(j, midline);
				r = RectList.cover(r, rect_list.get(j).rect);
			}
		}

		// Now that the midlines are the same, the height of our rectangle is
		// the height of the parentheses.  We have to shift all the arguments
		// to the right to make space for the left parenthesis.  By shifting
		// the rightmost one first, we avoid overlapping anything.

		var paren_w = context.getParenthesisWidth(r);

		for (var i=0; i<arg_count; i++)
		{
			rect_list.shift(arg_i[i], paren_w, 0);
		}

		// make space for 2 parentheses

		r.right += 2 * paren_w;

		return rect_list.add(r, midline, font_size, this);
	},

	render: function(
		/* Context2d */	context,
		/* RectList */	rect_list)
	{
		var info = rect_list.find(this);
		context.drawString(info.rect.left, info.midline, info.font_size, this.name);

		var r  =
		{
			top:    info.rect.top,
			bottom: info.rect.bottom
		};

		for (var i=0; i<this.args.length; i++)
		{
			this.args[i].render(context, rect_list);

			var info  = rect_list.find(this.args[i]);
			var arg_r = info.rect;
			if (i === 0)
			{
				r.left = arg_r.left;
			}

			if (i < this.args.length-1)
			{
				context.drawString(arg_r.right, info.midline, info.font_size, ',');
			}
			else
			{
				r.right = arg_r.right;
				context.drawParentheses(r);
			}
		}
	},

	toString: function()
	{
		return this.name + '(' + this.args.join(',') + ')';
	},

	/**
	 * Print an argument, with parentheses if necessary.
	 * 
	 * @param index {number|MathFunction} argument index or MathFunction
	 * @return {string} the string representation of the argument
	 * @protected
	 */
	_printArg: function(
		/* int */	index)
	{
		var arg = index instanceof MathFunction ? index : this.args[index];
		if (arg.parenthesizeForPrint(this))
		{
			return '(' + arg + ')';
		}
		else
		{
			return arg.toString();
		}
	}
});

MathFunction.FunctionWithArgs = MathFunctionWithArgs;
