YUI.add("gallery-sort-extras",function(c){var b=c.Lang.isArray;var a=c.namespace("Sort");a.drill=function(h,e,d){var j=h.length;for(var g=0;g<j;g++){var f=h[g];e=e[f];d=d[f];}return[e,d];};a.compareAsString=function(e,d){return(e<d?-1:e>d?+1:0);};a.compareAsStringNoCase=function(e,d){e=e.toLowerCase();d=d.toLowerCase();return(e<d?-1:e>d?+1:0);};a.compareAsNumber=function(e,d){return e-d;};a.compareKey=function(i,h,e,d){if(b(h)){var g=a.drill(h,e,d);return i(g[0],g[1]);}else{return i(e[h],d[h]);}};a.flip=function(d){return function(f,e){return d(e,f);};};},"@VERSION@",{requires:["oop"]});