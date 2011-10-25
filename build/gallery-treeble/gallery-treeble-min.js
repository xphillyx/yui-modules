YUI.add("gallery-treeble",function(Y){function TreebleDataSource(){TreebleDataSource.superclass.constructor.apply(this,arguments);}TreebleDataSource.NAME="treebleDataSource";TreebleDataSource.ATTRS={root:{writeOnce:true},paginateChildren:{value:false,validator:Y.Lang.isBoolean,writeOnce:true},uniqueIdKey:{validator:Y.Lang.isString}};function populateOpen(parent,open,req){var data=req.data;var startIndex=req.start;var childNodesKey=req.ds.treeble_config.childNodesKey;var nodeOpenKey=req.ds.treeble_config.nodeOpenKey;for(var j=0;j<open.length;j++){if(open[j].index>=startIndex){break;}}var uniqueIdKey=this.get("uniqueIdKey");var result=true;for(var k=0;k<data.length;k++){var i=startIndex+k;var ds=data[k][childNodesKey];if(!ds){continue;}while(j<open.length&&open[j].index<i){open.splice(j,1);result=false;if(uniqueIdKey){delete this._open_cache[data[k][uniqueIdKey]];}}if(j>=open.length||open[j].index>i){var item={index:i,open:null,ds:ds,children:[],childTotal:0,parent:parent};var cached_item=null;if(uniqueIdKey){cached_item=this._open_cache[data[k][uniqueIdKey]];if(cached_item){item.open=cached_item.open;item.childTotal=cached_item.childTotal;this._redo=this._redo||item.open;}}if(!cached_item&&nodeOpenKey&&data[k][nodeOpenKey]){this._toggle.push(req.path.concat(i));}open.splice(j,0,item);this._open_cache[data[k][uniqueIdKey]]=item;}j++;}return result;}function searchOpen(list,nodeIndex){for(var i=0;i<list.length;i++){if(list[i].index==nodeIndex){return list[i];}}return false;}function getNode(path){var open=this._open;var last=path.length-1;for(var i=0;i<last;i++){var node=searchOpen(open,path[i]);open=node.children;}return searchOpen(open,path[last]);}function countVisibleNodes(open){var total=0;if(!open){open=this._open;total=this._topNodeTotal;}if(this.get("paginateChildren")){for(var i=0;i<open.length;i++){var node=open[i];if(node.open){total+=node.childTotal;total+=countVisibleNodes.call(this,node.children);}}}return total;}function requestTree(){this._cancelAllRequests();this._redo=false;this._generating_requests=true;var req=this._callback.request;if(this.get("paginateChildren")){this._slices=getVisibleSlicesPgAll(req.startIndex,req.resultCount,this.get("root"),this._open);}else{this._slices=getVisibleSlicesPgTop(req.startIndex,req.resultCount,this.get("root"),this._open);}requestSlices.call(this,req);this._generating_requests=false;checkFinished.call(this);}function getVisibleSlicesPgTop(skip,show,ds,open,path){open=open.concat({index:-1,open:true,childTotal:0,children:null});if(!path){path=[];}var slices=[],send=false;var m=0,prev=-1,presend=false;for(var i=0;i<open.length;i++){var node=open[i];if(!node.open){continue;}var delta=node.index-prev;if(m+delta>=skip+show||node.index==-1){slices.push({ds:ds,path:path.slice(0),start:send?m:skip,end:skip+show-1});if(m+delta==skip+show){slices=slices.concat(getVisibleSlicesPgTop(0,node.childTotal,node.ds,node.children,path.concat(node.index)));}return slices;}else{if(!send&&m+delta==skip){presend=true;}else{if(m+delta>skip){slices.push({ds:ds,path:path.slice(0),start:send?prev+1:skip,end:m+delta-1});send=true;}}}m+=delta;if(send&&node.childTotal>0){slices=slices.concat(getVisibleSlicesPgTop(0,node.childTotal,node.ds,node.children,path.concat(node.index)));}prev=node.index;send=send||presend;}}function getVisibleSlicesPgAll(skip,show,rootDS,open,path,parent,pre,send,slices){if(!parent){path=[];parent=null;pre=0;send=false;slices=[];}var ds=parent?parent.ds:rootDS;open=open.concat({index:parent?parent.childTotal:-1,open:true,childTotal:0,children:null});var n=0,m=0,prev=-1;for(var i=0;i<open.length;i++){var node=open[i];if(!node.open){continue;}var delta=node.index-prev;if(node.children===null){delta--;}if(pre+n+delta>=skip+show||node.index==-1){slices.push({ds:ds,path:path.slice(0),start:m+(send?0:skip-pre-n),end:m+(skip+show-1-pre-n)});return slices;}else{if(!send&&pre+n+delta==skip){send=true;}else{if(pre+n+delta>skip){slices.push({ds:ds,path:path.slice(0),start:m+(send?0:skip-pre-n),end:m+delta-1});send=true;}}}n+=delta;m+=delta;if(node.childTotal>0){var info=getVisibleSlicesPgAll(skip,show,rootDS,node.children,path.concat(node.index),node,pre+n,send,slices);if(Y.Lang.isArray(info)){return info;}else{n+=info.count;send=info.send;}}prev=node.index;}var info={count:n,send:send};return info;}function requestSlices(request){for(var i=0;i<this._slices.length;i++){var slice=this._slices[i];var ds=slice.ds;var req=findRequest.call(this,ds);if(req){if(Y.Console){if(req.end+1<slice.start){Y.error("TreebleDataSource found discontinuous range");}if(req.path.length!=slice.path.length){Y.error("TreebleDataSource found path length mismatch");}else{for(var j=0;j<slice.path.length;j++){if(req.path[j]!=slice.path[j]){Y.error("TreebleDataSource found path mismatch");break;}}}}req.end=slice.end;}else{this._req.push({ds:ds,path:slice.path,start:slice.start,end:slice.end});}}request=Y.clone(request,true);for(var i=0;i<this._req.length;i++){var req=this._req[i];request.startIndex=req.start;request.resultCount=req.end-req.start+1;req.txId=req.ds.sendRequest({request:req.ds.treeble_config.generateRequest(request,req.path),cfg:req.ds.treeble_config.requestCfg,callback:{success:Y.rbind(treeSuccess,this,i),failure:Y.rbind(treeFailure,this,i)}});}}function findRequest(ds){for(var i=0;i<this._req.length;i++){var req=this._req[i];if(ds==req.ds){return req;}}return null;}function treeSuccess(e,reqIndex){if(!e.response||e.error||!Y.Lang.isArray(e.response.results)){treeFailure.apply(this,arguments);return;}var req=searchTxId(this._req,e.tId,reqIndex);if(!req){return;}if(!this._topResponse&&req.ds==this.get("root")){this._topResponse=e.response;}req.txId=null;req.resp=e.response;req.error=false;var dataStartIndex=0;if(req.ds.treeble_config.startIndexExpr){eval("dataStartIndex=req.resp"+req.ds.treeble_config.startIndexExpr);}var sliceStartIndex=req.start-dataStartIndex;req.data=e.response.results.slice(sliceStartIndex,req.end-dataStartIndex+1);setNodeInfo(req.data,req.start,req.path,req.ds);
var parent=(req.path.length>0?getNode.call(this,req.path):null);var open=(parent!==null?parent.children:this._open);if(!populateOpen.call(this,parent,open,req)){treeFailure.apply(this,arguments);return;}if(!parent&&req.ds.treeble_config.totalRecordsExpr){eval("this._topNodeTotal=e.response"+req.ds.treeble_config.totalRecordsExpr);}else{if(!parent&&req.ds.treeble_config.totalRecordsReturnExpr){this._topNodeTotal=e.response.results.length;}}checkFinished.call(this);}function treeFailure(e,reqIndex){var req=searchTxId(this._req,e.tId,reqIndex);if(!req){return;}this._cancelAllRequests();this._callback.error=e.error;this._callback.response=e.response;this.fire("response",this._callback);}function setNodeInfo(list,offset,path,ds){var depth=path.length;for(var i=0;i<list.length;i++){list[i]._yui_node_depth=depth;list[i]._yui_node_path=path.concat(offset+i);list[i]._yui_node_ds=ds;}}function searchTxId(req,id,fallbackIndex){for(var i=0;i<req.length;i++){if(req[i].txId===id){return req[i];}}if(fallbackIndex<req.length&&Y.Lang.isUndefined(req[fallbackIndex].txId)){return req[fallbackIndex];}return null;}function checkFinished(){if(this._generating_requests){return;}var count=this._req.length;for(var i=0;i<count;i++){if(!this._req[i].resp){return;}}if(this._redo){Y.Lang.later(0,this,requestTree);return;}else{if(this._toggle.length>0){this.toggle(this._toggle[0],Y.clone(this._callback.request,true),{fn:function(){Y.Lang.later(0,this,requestTree);},scope:this});return;}}var response={};Y.mix(response,this._topResponse);response.results=[];response=Y.clone(response,true);count=this._slices.length;for(i=0;i<count;i++){var slice=this._slices[i];var req=findRequest.call(this,slice.ds);if(!req){Y.error("Failed to find request for a slice");continue;}var j=slice.start-req.start;var data=req.data.slice(j,j+slice.end-slice.start+1);response.results=response.results.concat(data);}var rootDS=this.get("root");if(rootDS.treeble_config.totalRecordsExpr){eval("response"+rootDS.treeble_config.totalRecordsExpr+"="+countVisibleNodes.call(this));}else{if(rootDS.treeble_config.totalRecordsReturnExpr){eval("response"+rootDS.treeble_config.totalRecordsReturnExpr+"="+countVisibleNodes.call(this));}}this._callback.response=response;this.fire("response",this._callback);}function toggleSuccess(e,node,completion){if(node.ds.treeble_config.totalRecordsExpr){eval("node.childTotal=e.response"+node.ds.treeble_config.totalRecordsExpr);}else{if(node.ds.treeble_config.totalRecordsReturnExpr){node.childTotal=e.response.results.length;}}node.open=true;node.children=[];complete(completion);}function toggleFailure(e,node,completion){node.childTotal=0;node.open=true;node.children=[];complete(completion);}function complete(f){if(Y.Lang.isFunction(f)){f();}else{if(f&&f.fn){f.fn.apply(f.scope||window,Y.Lang.isUndefined(f.args)?[]:f.args);}}}Y.extend(TreebleDataSource,Y.DataSource.Local,{initializer:function(config){if(!config.root){Y.error("TreebleDataSource requires DataSource");}if(!config.root.treeble_config.childNodesKey){var fields=config.root.schema.get("schema").resultFields;if(!fields||!Y.Lang.isArray(fields)){Y.error("TreebleDataSource root DataSource requires schema.resultFields because treeble_config.childNodesKey was not specified.");}for(var i=0;i<fields.length;i++){if(Y.Lang.isObject(fields[i])&&fields[i].parser=="treebledatasource"){config.root.treeble_config.childNodesKey=fields[i].key;break;}}if(!config.root.treeble_config.childNodesKey){Y.error("TreebleDataSource requires treeble_config.childNodesKey configuration to be set on root DataSource");}}if(!config.root.treeble_config.generateRequest){Y.error("TreebleDataSource requires treeble_config.generateRequest configuration to be set on root DataSource");}if(!config.root.treeble_config.totalRecordsExpr&&!config.root.treeble_config.totalRecordsReturnExpr){Y.error("TreebleDataSource requires either treeble_config.totalRecordsExpr or treeble_config.totalRecordsReturnExpr configuration to be set on root DataSource");}this._open=[];this._open_cache={};this._toggle=[];this._req=[];},isOpen:function(path){var list=this._open;for(var i=0;i<path.length;i++){var node=searchOpen.call(this,list,path[i]);if(!node||!node.open){return false;}list=node.children;}return true;},toggle:function(path,request,completion){var list=this._open;for(var i=0;i<path.length;i++){var node=searchOpen.call(this,list,path[i]);if(!node){return false;}list=node.children;}if(node.open===null){request.startIndex=0;request.resultCount=0;node.ds.sendRequest({request:node.ds.treeble_config.generateRequest(request,path),cfg:node.ds.treeble_config.requestCfg,callback:{success:Y.rbind(toggleSuccess,this,node,completion),failure:Y.rbind(toggleFailure,this,node,completion)}});}else{node.open=!node.open;complete(completion);}return true;},_defRequestFn:function(e){if(this._callback){Y.Object.some(this._callback.request,function(value,key){if(key=="startIndex"||key=="resultCount"){return false;}if(value!==e.request[key]){this._open=[];return true;}});}this._callback=e;requestTree.call(this);},_cancelAllRequests:function(){this._req=[];this._toggle=[];}});Y.TreebleDataSource=TreebleDataSource;Y.namespace("Parsers").treebledatasource=function(oData){if(!oData){return null;}var type=oData.dataType;if(type){}else{if(Y.Lang.isString(oData)){type="IO";}else{if(Y.Lang.isFunction(oData)){type="Function";}else{type="Local";}}}var src=oData.dataType?oData.liveData:oData;var treeble_config=this.get("host").treeble_config;if(type=="Local"){treeble_config=Y.clone(treeble_config,true);delete treeble_config.startIndexExpr;delete treeble_config.totalRecordsExpr;}else{if(type=="Function"){src=Y.Lang.isString(src)?window[src]:src;}}var ds=new Y.DataSource[type]({source:src});ds.treeble_config=treeble_config;if(ds.treeble_config.schemaPluginConfig){ds.plug(Y.clone(ds.treeble_config.schemaPluginConfig,true));}if(ds.treeble_config.cachePluginConfig){ds.plug(Y.clone(ds.treeble_config.cachePluginConfig,true));}return ds;};Y.namespace("Treeble").buildTwistdownFormatter=function(sendRequest){return function(o){var td=this.createCell(o);
td.addClass("treeble-nub");var ds=this.datasource.get("datasource");var key=ds.get("root").treeble_config.childNodesKey;if(o.data[key]){var path=o.data._yui_node_path;var open=ds.isOpen(path);var clazz=open?"row-open":"row-closed";td.addClass("row-toggle");td.replaceClass(/row-(open|closed)/,clazz);td.on("click",function(){ds.toggle(path,{},sendRequest);});td.set("innerHTML",'<a class="treeble-collapse-nub" href="javascript:void(0);"></a>');}else{td.set("innerHTML","");}return"";};};Y.namespace("Treeble").treeValueFormatter=function(o){var depth_class="treeble-depth-"+o.data._yui_node_depth;return'<span class="'+depth_class+'">'+o.value+"</span>";};},"@VERSION@",{requires:["datasource"],skinnable:true});