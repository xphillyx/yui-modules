YUI.add("gallery-notify",function(G){var B={INIT:"init",STARTED:"started"},C=G.Lang,E="boundingBox",D="contentBox",A="closable",F="default",H="type";G.namespace("Notify").Message=G.Base.create("notify-message",G.Widget,[G.WidgetChild],{BOUNDING_TEMPLATE:"<li/>",CONTENT_TEMPLATE:"<em/>",CLOSE_TEMPLATE:'<span class="{class}">{label}</span>',_timer:null,initializer:function(I){this.get(E).setStyle("opacity",0);},renderUI:function(){var I=this.get(D),K=this.get(E),J;I.setContent(this.get("message"));if(this.get(A)){J=new G.Button({type:"close",callback:G.bind(this.close,this),render:true});K.append(J.get("boundingBox").remove());}},bindUI:function(){this._bindHover();},syncUI:function(){this.timer=new G.Timer({length:this.get("timeout"),repeatCount:1,callback:G.bind(this.close,this)});this.get(E).appear({afterFinish:G.bind(function(){this.timer.start();},this)});},close:function(){if(this.timer){this.timer.stop();this.timer=null;}this.get(E).fade({on:{finish:G.bind(function(I){I.preventDefault();this.destroy();},this)}});},_bindHover:function(){var I=this.get(E);I.on("mouseenter",G.bind(function(J){this.timer.pause();},this));I.on("mouseleave",G.bind(function(J){if(this.timer){this.timer.resume();}},this));}},{ATTRS:{closable:{value:true,validator:C.isBoolean},message:{validator:C.isString},timeout:{value:8000},type:{validator:C.isString,setter:function(I){this.get(E).replaceClass(this.getClassName(H,this.get(H)||F),this.getClassName(H,I||F));return I;},lazyAdd:false}}});G.Notify=G.Base.create("notify",G.Widget,[G.WidgetParent,G.EventTarget],{CONTENT_TEMPLATE:"<ul/>",_childConfig:{},initializer:function(I){this.publish(B.INIT,{broadcast:1});this.publish(B.STARTED,{broadcast:1});this.fire(B.INIT);this._buildChildConfig();},syncUI:function(){this.fire(B.STARTED);},addMessage:function(K,J,I){if(!J){J=F;}this._buildChildConfig(K,J);if(I){return this.add(this._childConfig,I);}if(this.get("prepend")){return this.add(this._childConfig,0);}return this.add(this._childConfig);},addMessages:function(K){var L,J,I;for(L in K){if(C.isArray(K[L])){for(J=0,I=K[L].length;J<I;J++){this.addMessage(K[L][J],L);}}}},_buildChildConfig:function(J,I){this._childConfig={closable:this.get(A),timeout:this.get("timeout"),message:J,type:I};}},{ATTRS:{closable:{value:true,validator:C.isBoolean},defaultChildType:{value:G.Notify.Message},prepend:{value:false,validator:C.isBoolean},timeout:{value:8000}},EVENTS:B});},"gallery-2010.09.08-19-45",{requires:["base","anim","substitute","widget","widget-parent","widget-child","gallery-timer","event-mouseenter","gallery-effects","gallery-button"]});