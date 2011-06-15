YUI.add('gallery-io-multiresponse', function(Y) {

/**
 * <p>Extends the IO base class to enable multiple responses using an
 * iframe as the transport medium.</p>
 * 
 * @module io
 * @submodule io-multiresponse
 */

/**
 * <p>Extends the IO base class to enable multiple responses using an
 * iframe as the transport medium.  Each response fires the response event.
 * The only events that are fired are the start and end events.</p>
 * 
 * <p>All the YUI 3 IO features are supported, so the request can be sent
 * as either GET (for simple query args) or POST (for anything, even file
 * uploads).  The module uses an iframe to send the request and includes a
 * callback parameter.  (So you cannot include a parameter named
 * <q>callback</q>.)  For each response, the server must send a script
 * block invoking the callback, similar to JSONP.  Unlike JSONP, however,
 * requests can only be made to your own server because the callback will
 * reference <code>window.parent</code>.  In order to trigger script
 * parsing in all browsers, the first chunk of data that the server writes
 * to the connection must be at least 1024 bytes, and it must be part of
 * the body, so you will need to explicitly send an empty head.</p>
 * 
 * <p>Due to the way that the request data is parsed, it is not safe to
 * send JSON-encoded data using the standard YUI 3 IO methods.  However, if
 * you define <code>json</code> in the configuration passed to
 * <code>Y.io()</code>, then the data will be passed to the server under
 * the <code>json</code> parameter.  (If you pass an object, it will be
 * serialized with <code>Y.JSON.stringify()</code>.)
 * 
 * <p>To keep the iframe after it has finished loading, set
 * <code>debug:true</code> in the configuration passed to
 * <code>Y.io()</code>.</p>
 * 
 * @class io~multiresponse
 */

var w = Y.config.win,
    d = Y.config.doc,
    _std = (d.documentMode && d.documentMode >= 8),
    _d = decodeURIComponent;

/**
 * @description Parses the POST data object and creates hidden form elements
 * for each key-value, and appends them to the HTML form object.
 * @method _addData
 * @private
 * @static
 * @param {object} f HTML form object.
 * @param {string} s The key-value POST data.
 * @return {array} Array of created fields.
 */
function _addData(f, s) {
    var o = [],
        m = s.split('='),
        i, l;

    for (i = 0, l = m.length - 1; i < l; i++) {
        o[i] = d.createElement('input');
        o[i].type = 'hidden';
        o[i].name = _d(m[i].substring(m[i].lastIndexOf('&') + 1));
        o[i].value = (i + 1 === l) ? _d(m[i + 1]) : _d(m[i + 1].substring(0, (m[i + 1].lastIndexOf('&'))));
        f.appendChild(o[i]);
        Y.log('key: ' +  o[i].name + ' and value: ' + o[i].value + ' added as form data.', 'info', 'io');
    }

    return o;
}

/**
 * @description Adds JSON encoded data to the form.
 * @method _addJSON
 * @private
 * @static
 * @param {object} f HTML form object.
 * @param {string|object} s The JSON data or object to serialize.
 * @return {array} created fields.
 */
function _addJSON(f, s) {
    if (!Y.Lang.isString(s)) {
        s = Y.JSON.stringify(s);
    }

    var el  = d.createElement('input');
    el.type = 'hidden';
    el.name = 'json';
    el.value = s;
    f.appendChild(el);
    Y.log('key: json and value: ' + s + ' added as form data.', 'info', 'io');

    return el;
}

/**
 * @description Removes the custom fields created to pass additional POST
 * data, along with the HTML form fields.
 * @method _removeData
 * @private
 * @static
 * @param {object} f HTML form object.
 * @param {object} o HTML form fields created from configuration.data.
 * @return {void}
 */
function _removeData(f, o) {
    var i, l;

    for (i = 0, l = o.length; i < l; i++) {
        f.removeChild(o[i]);
    }
}

/**
 * @description Sets the appropriate attributes and values to the HTML
 * form, in preparation of a file upload transaction.
 * @method _setAttrs
 * @private
 * @static
 * @param {object} f HTML form object.
 * @param {object} id The Transaction ID.
 * @param {object} uri Qualified path to transaction resource.
 * @param {string} method POST or GET.
 * @return {void}
 */
function _setAttrs(f, id, uri, method) {
    f.setAttribute('action', uri);
    f.setAttribute('method', method || 'POST');
    f.setAttribute('target', 'io-multi-response-' + id );
    f.setAttribute(Y.UA.ie && !_std ? 'encoding' : 'enctype', 'multipart/form-data');
}

/**
 * @description Reset the HTML form attributes to their original values.
 * @method _resetAttrs
 * @private
 * @static
 * @param {object} f HTML form object.
 * @param {object} a Object of original attributes.
 * @return {void}
 */
function _resetAttrs(f, a){
    Y.Object.each(a, function(v, p) {
        if (v) {
            f.setAttribute(p, v);
        }
        else {
            f.removeAttribute(p);
        }
    });
}

/**
 * @description Starts timeout count if the configuration object
 * has a defined timeout property.
 *
 * @method _startTimeout
 * @private
 * @static
 * @param {object} o Transaction object generated by _create().
 * @param {object} c Configuration object passed to YUI.io().
 * @return {void}
 */
function _startTimeout(o, c) {
    Y.io._timeout[o.id] = w.setTimeout(
        function() {
            var r = { id: o.id, status: 'timeout' };

            Y.io.end(r, c);
            Y.log('Transaction ' + o.id + ' timeout.', 'info', 'io');
        }, c.timeout);
}

/**
 * @description Clears the timeout interval started by _startTimeout().
 * @method _clearTimeout
 * @private
 * @static
 * @param {number} id - Transaction ID.
 * @return {void}
 */
function _clearTimeout(id) {
    w.clearTimeout(Y.io._timeout[id]);
    delete Y.io._timeout[id];
}

/**
 * @description Destroy the iframe and temp form, if any.
 * @method _destroy
 * @private
 * @static
 * @param {number} id Transaction id.
 * @param {object} c Configuration object for the transaction.
 * @return {void}
 */
function _destroy(id, c) {
    if (!c.debug) {
        Y.Event.purgeElement('#io-multi-response-' + id, false);
        Y.one('body').removeChild(Y.one('#io-multi-response-' + id));
        Y.log('The iframe for transaction ' + id + ' has been destroyed.', 'info', 'io');
    }

    if (c.form.id.indexOf('io-multi-response-form-') === 0) {
        Y.one('body').removeChild(Y.one('#' + c.form.id));
        Y.log('The temporary form for transaction ' + id + ' has been destroyed.', 'info', 'io');
    }
}

/**
 * @description Bound to the iframe's Load event and processes
 * the response data.
 * @method _handle
 * @private
 * @static
 * @param {o} o The transaction object
 * @param {object} c Configuration object for the transaction.
 * @return {void}
 */
function _handle(o, c) {
    if (c.timeout) {
        _clearTimeout(o.id);
    }

    Y.io.end(o, c);
    // The transaction is complete, so call _destroy to remove
    // the event listener bound to the iframe, and then
    // destroy the iframe.
    w.setTimeout( function() { _destroy(o.id, c); }, 0);
}

/**
 * @description Creates the iframe used in file upload
 * transactions, and binds the response event handler.
 *
 * @method _create
 * @private
 * @static
 * @param {object} o Transaction object generated by _create().
 * @param {object} c Configuration object passed to YUI.io().
 * @return {void}
 */
function _create(o, c) {
    var i = Y.Node.create('<iframe id="io-multi-response-' + o.id + '" name="io-multi-response-' + o.id + '" />');
        i._node.style.position = 'absolute';
        i._node.style.top = '-1000px';
        i._node.style.left = '-1000px';

    Y.one('body').appendChild(i);
    // Bind the onload handler to the iframe to detect the file upload response.
    Y.on("load", function() { _handle(o, c); }, '#io-multi-response-' + o.id);
}

/**
 * @description Creates a temporary form, if the caller doesn't provide one.
 *
 * @method _createForm
 * @private
 * @static
 * @param {object} c Configuration object passed to YUI.io().
 * @return {string} form id
 */
function _createForm(c) {
    var id = Y.guid('io-multi-response-form-'),
        f = Y.Node.create('<form id="' + id + '" name="' + id + '" />');
        f._node.style.position = 'absolute';
        f._node.style.top = '-1000px';
        f._node.style.left = '-1000px';

    Y.one('body').appendChild(f);
    return id;
}

/**
 * @description Uploads HTML form data, inclusive of files/attachments,
 * using the iframe created in _create to facilitate the transaction.
 * @method _send
 * @private
 * @static
 * @param {o} o The transaction object
 * @param {object} uri Qualified path to transaction resource.
 * @param {object} c Configuration object for the transaction.
 * @return {void}
 */
function _send(o, uri, c) {
    var f = (typeof c.form.id === 'string') ? d.getElementById(c.form.id) : c.form.id,
        fields = [],
        // Track original HTML form attribute values.
        attr = {
            method: f.getAttribute('method'),
            action: f.getAttribute('action'),
            target: f.getAttribute('target')
        };

    // Initialize the HTML form properties in case they are
    // not defined in the HTML form.
    _setAttrs(f, o.id, uri, c.method);
    if (c.data) {
        fields = _addData(f, c.data);
    }
    if (c.json) {
        fields.push(_addJSON(f, c.json));
    }

    // Start polling if a callback is present and the timeout
    // property has been defined.
    if (c.timeout) {
        _startTimeout(o, c);
        Y.log('Transaction timeout started for transaction ' + o.id + '.', 'info', 'io');
    }

    // Start file upload.
    f.submit();
    Y.io.start(o.id, c);
    if (c.data) {
        _removeData(f, fields);
    }
    // Restore HTML form attributes to their original values.
    _resetAttrs(f, attr);

    return {
        id: o.id,
        abort: function() {
            var r = { id: o.id, status: 'abort' };

            if (Y.one('#io-multi-response-' + o.id)) {
                _destroy(o.id, c);
                Y.io.end(r, c);
                Y.log('Transaction ' + o.id + ' aborted.', 'info', 'io');
            }
            else {
                Y.log('Attempted to abort transaction ' + o.id + ' but transaction has completed.', 'warn', 'io');
                return false;
            }
        },
        isInProgress: function() {
            return Y.one('#io-multi-response-' + o.id) ? true : false;
        }
    };
}

/**
 * @description Method for creating and subscribing transaction events.
 *
 * @method _tE
 * @private
 * @static
 * @param {string} e - event to be published
 * @param {object} c - configuration data subset for event subscription.
 * @return {void}
 */
function _tE(e, c) {
    var eT = new Y.EventTarget().publish('transaction:' + e),
        a = c.arguments,
        cT = c.context || Y;

    if (a) {
        eT.on(c.on[e], cT, a);
    }
    else {
        eT.on(c.on[e], cT);
    }

    return eT;
}

var orig_upload = Y.io.upload;

/* @param {object} o - transaction object.
 * @param {string} uri - qualified path to transaction resource.
 * @param {object} c - configuration object for the transaction.
 * @return object
 */
Y.io.upload = function(o, uri, c) {
    if (!c.multiresponse) {
        return orig_upload.apply(this, arguments);
    }

    YUI.Env.io_multi_response_callback[ o.id ] = function(data) {
        if (!data) {
            Y.error('Callback ' + o.id + ' invoked without data.', null, 'io');
            return;
        }

        // reset timeout
        if (c.timeout) {
            _clearTimeout(o.id);
            _startTimeout(o, c);
        }

        if (c.on && c.on.response) {
            _tE('response', c).fire(o.id, data);
        }
    };

    var callback_arg = 'callback=' + encodeURIComponent('window.parent.YUI.Env.io_multi_response_callback[' + o.id + ']');
    c.data = c.data ? c.data + '&' + callback_arg : callback_arg;

    if (c.form && !c.form.id) {
        delete c.form;
    }

    _create(o, c);
    return _send(o, uri, c);
};

if (!YUI.Env.io_multi_response_callback)
{
    YUI.Env.io_multi_response_callback = [];
}

var orig_io = Y.io;

/* @param {string} uri - qualified path to transaction resource.
 * @param {object} c - configuration object for the transaction.
 * @param {number} i - transaction id, if already set.
 * @return object
 */
Y.io = function(uri, c, i) {
    if (c.multiresponse && !c.form) {
        c.form = {
            id:     _createForm(c),
            upload: true
        };
    }
    else if (c.multiresponse && !c.form.upload) {
        c.form.upload = true;
    }

    orig_io.call(this, uri, c, i);
};

Y.mix(Y.io, orig_io);


}, '@VERSION@' ,{optional:['json-stringify'], requires:['io-upload-iframe']});
