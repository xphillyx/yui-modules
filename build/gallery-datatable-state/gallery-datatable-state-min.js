YUI.add("gallery-datatable-state",function(h){function e(i){e.superclass.constructor.call(this,i);}e.NAME="DataTableStatePlugin";e.NS="state";e.ATTRS={uniqueIdKey:{validator:h.Lang.isString},save:{value:[],validator:h.Lang.isArray}};function g(i,j){delete j[i];}function c(i){h.each(this.state,h.bind(g,null,i));}function f(){var i=this.get("host")._displayColumns;h.each(this.get("save"),function(j){j.column_index=h.Array.findIndexOf(i,function(k){return k.key===j.column;});if(j.column_index<0){c.call(this,j.column);}},this);}function b(){var j=this.get("host");var i=j.data.size();var k=this.get("uniqueIdKey");h.each(this.get("save"),function(o){if(o.column_index<0){return;}for(var m=0;m<i;m++){var q=null;var l=j.getCell([m,o.column_index]);if(l){if(o.node){var n=l.one(o.node);if(n){q=n.get(o.key);}}else{if(o.widget){var p=h.Widget.getByNode(l.one(o.widget));if(p){q=p.get(o.key);}}}}var r=j.getRecord(m);var s=r.get(k);if(!this.state[s]){this.state[s]={};}this.state[s][o.column]=q;}},this);}function d(){var j=this.get("host");var i=j.data.size();var k=this.get("uniqueIdKey");h.each(this.get("save"),function(o){if(o.column_index<0){return;}for(var m=0;m<i;m++){var s=j.getRecord(m);var r=this.state[s.get(k)];if(r){var q=r[o.column];var l=j.getCell([m,o.column_index]);if(l){if(o.node){var n=l.one(o.node);if(n){n.set(o.key,q);}}else{if(o.widget){var p=h.Widget.getByNode(l.one(o.widget));if(p){p.set(o.key,q);}}}}}}},this);}function a(){h.each(this.get("save"),function(i){if(i.column_index<0||i.temp){c.call(this,i.column);}},this);}h.extend(e,h.Plugin.Base,{initializer:function(j){this.state={};this.on("uniqueIdKeyChange",function(){this.state={};});f.call(this);this.after("saveChange",f);this.afterHostEvent("columnsChange",f);var k=this.get("host");var i=this;var l=this.orig_syncUI=k.syncUI;k.syncUI=function(){b.call(i);l.apply(k,arguments);d.call(i);};this.onHostEvent("dataChange",b);this.afterHostEvent("dataChange",function(){h.later(0,this,d);});h.Global.on("paginator:changeRequest",a,this);},destructor:function(){this.get("host").syncUI=this.orig_syncUI;},getState:function(){b.call(this);return this.state;}});h.namespace("Plugin");h.Plugin.DataTableState=e;},"@VERSION@",{requires:["datatable","plugin","gallery-funcprog","gallery-node-optimizations"]});