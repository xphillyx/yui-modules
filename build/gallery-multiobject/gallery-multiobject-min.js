YUI.add("gallery-multiobject",function(f){function c(g,h){this.items=f.Array(g);var i=this.items[0];for(var j in i){if(f.Lang.isFunction(i[j])&&!this[j]){this[j]=d.call(this,j);}}this.args_adjuster={};h=h||{};this.primary_item_index=h.primary_item_index||0;this.return_all_results=h.return_all_results;f.Array.each(this.items,b,this);h.prefix=this.items[0].name;c.superclass.constructor.call(this,h);}function d(g){return function(){var h=arguments;var i=[];f.Array.each(this.items,function(l,k){var m=h;if(this.args_adjuster[g]){m=this.args_adjuster[g].call(l,k,f.Array(h,0,true));}var j=l[g].apply(l,m);if(!f.Lang.isUndefined(j)&&j!==l){i.push(j);}},this);if(i.length===0){return this;}else{if(this.return_all_results){return i;}else{return i[this.primary_item_index];}}};}function e(i,g,h){f.Array.each(this.items,function(k,j){if(j!==g){k.set(h,i.newVal);}});}function b(h,g){if(!h){return;}f.Object.each(h.getAttrs(),function(j,i){h.after(i+"Change",e,this,g,i);},this);h.addTarget(this);}function a(h,g){if(!h){return;}f.Object.each(h.getAttrs(),function(j,i){h.detach(i+"Change",e,this);},this);h.removeTarget(this);}f.extend(c,f.EventTarget,{multi_destroy:function(){f.Array.each(this.items,a,this);},multi_get_primary_item_index:function(){return this.primary_item_index;},multi_set_primary_item_index:function(g){this.primary_item_index=g;},multi_get_return_all_results:function(){return this.return_all_results;},multi_set_return_all_results:function(g){this.return_all_results=g;},multi_get_all:function(j){var g=f.Array(arguments,0,true);g.shift();var i=this.return_all_results;this.return_all_results=true;var h=this[j].apply(this,g);this.return_all_results=i;return h;}});f.MultiObject=c;},"@VERSION@",{requires:["event-custom"]});