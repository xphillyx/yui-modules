YUI.add("gallery-user-patch-2529808",function(b){var a=b.Plugin.DataTableScroll;if(!a.prototype.orig_syncWidths){a.prototype.orig_initializer=a.prototype.initializer;a.prototype.initializer=function(){this.orig_initializer();this.afterHostEvent("recordsetChange",this.syncUI);};a.prototype.orig_syncWidths=a.prototype._syncWidths;a.prototype._syncWidths=function(){var c=this.get("host"),d=c.get("recordset");if(d.getLength()===0){return;}this.orig_syncWidths();};}},"gallery-2011.05.18-19-11",{requires:["datatable-scroll"]});