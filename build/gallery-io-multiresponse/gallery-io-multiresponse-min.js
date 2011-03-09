YUI.add("gallery-io-multiresponse",function(A){var K=A.config.win,R=A.config.doc,B=(R.documentMode&&R.documentMode>=8),D=decodeURIComponent;function H(Y,X){var Z=[],U=X.split("="),W,V;for(W=0,V=U.length-1;W<V;W++){Z[W]=R.createElement("input");Z[W].type="hidden";Z[W].name=D(U[W].substring(U[W].lastIndexOf("&")+1));Z[W].value=(W+1===V)?D(U[W+1]):D(U[W+1].substring(0,(U[W+1].lastIndexOf("&"))));Y.appendChild(Z[W]);}return Z;}function F(W,V){if(!A.Lang.isString(V)){V=A.JSON.stringify(V);}var U=R.createElement("input");U.type="hidden";U.name="json";U.value=V;W.appendChild(U);return U;}function J(W,X){var V,U;for(V=0,U=X.length;V<U;V++){W.removeChild(X[V]);}}function E(V,X,U,W){V.setAttribute("action",U);V.setAttribute("method",W||"POST");V.setAttribute("target","io-multi-response-"+X);V.setAttribute(A.UA.ie&&!B?"encoding":"enctype","multipart/form-data");}function C(V,U){var W;for(W in U){if(U.hasOwnProperty(W)){if(U[W]){V.setAttribute(W,V[W]);}else{V.removeAttribute(W);}}}}function O(U,V){A.io._timeout[U.id]=K.setTimeout(function(){var W={id:U.id,status:"timeout"};A.io.end(W,V);},V.timeout);}function L(U){K.clearTimeout(A.io._timeout[U]);delete A.io._timeout[U];}function I(V,U){if(!U.debug){A.Event.purgeElement("#io-multi-response-"+V,false);A.one("body").removeChild(A.one("#io-multi-response-"+V));}if(U.form.id.indexOf("io-multi-response-form-")===0){A.one("body").removeChild(A.one("#"+U.form.id));}}function G(U,V){if(V.timeout){L(U.id);}A.io.end(U,V);K.setTimeout(function(){I(U.id,V);},0);}function Q(V,W){var U=A.Node.create('<iframe id="io-multi-response-'+V.id+'" name="io-multi-response-'+V.id+'" />');U._node.style.position="absolute";U._node.style.top="-1000px";U._node.style.left="-1000px";A.one("body").appendChild(U);A.on("load",function(){G(V,W);},"#io-multi-response-"+V.id);}function P(W){var V=A.guid("io-multi-response-form-"),U=A.Node.create('<form id="'+V+'" name="'+V+'" />');U._node.style.position="absolute";U._node.style.top="-1000px";U._node.style.left="-1000px";A.one("body").appendChild(U);return V;}function T(Y,W,Z){var X=(typeof Z.form.id==="string")?R.getElementById(Z.form.id):Z.form.id,V=[],U={method:X.getAttribute("method"),action:X.getAttribute("action"),target:X.getAttribute("target")};E(X,Y.id,W,Z.method);if(Z.data){V=H(X,Z.data);}if(Z.json){V.push(F(X,Z.json));}if(Z.timeout){O(Y,Z);}X.submit();A.io.start(Y.id,Z);if(Z.data){J(X,V);}C(X,U);return{id:Y.id,abort:function(){var a={id:Y.id,status:"abort"};if(A.one("#io-multi-response-"+Y.id)){I(Y.id,Z);A.io.end(a,Z);}else{return false;}},isInProgress:function(){return A.one("#io-multi-response-"+Y.id)?true:false;}};}function M(X,Y){var W=new A.EventTarget().publish("transaction:"+X),U=Y.arguments,V=Y.context||A;if(U){W.on(Y.on[X],V,U);}else{W.on(Y.on[X],V);}return W;}var N=A.io.upload;A.io.upload=function(V,U,W){if(!W.multiresponse){return N.apply(this,arguments);}YUI.Env.io_multi_response_callback[V.id]=function(X){if(!X){return;}L(V.id);O(V,W);if(W.on&&W.on.response){M("response",W).fire(V.id,X);}};W.data=(W.data||"")+"callback="+encodeURIComponent("window.parent.YUI.Env.io_multi_response_callback["+V.id+"]");if(W.form&&!W.form.id){delete W.form;}Q(V,W);return T(V,U,W);};YUI.Env.io_multi_response_callback=[];var S=A.io;A.io=function(V,W,U){if(W.multiresponse&&!W.form){W.form={id:P(W),upload:true};}else{if(W.multiresponse&&!W.form.upload){W.form.upload=true;}}S.call(this,V,W,U);};A.mix(A.io,S);},"@VERSION@",{optional:["json-stringify"],requires:["io-upload-iframe"]});