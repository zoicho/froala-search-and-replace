$( document ).ready(function() {

    let defaultHtml = `<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas aliquet accumsan leo. 
Nunc tincidunt ante vitae massa. Nulla est. Mauris dolor felis, sagittis at, 
luctus sed, aliquam non, tellus. Aliquam erat volutpat. Aliquam erat volutpat. 
Nulla quis diam. Integer pellentesque quam vel velit. Nam libero tempore, 
cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod 
maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas aliquet accumsan leo. 
Nunc tincidunt ante vitae massa. Nulla est. Mauris dolor felis, sagittis at, 
luctus sed, aliquam non, tellus. Aliquam erat volutpat. Aliquam erat volutpat. 
Nulla quis diam. Integer pellentesque quam vel velit. Nam libero tempore, 
cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod 
maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas aliquet accumsan leo. 
Nunc tincidunt ante vitae massa. Nulla est. Mauris dolor felis, sagittis at, 
luctus sed, aliquam non, tellus. Aliquam erat volutpat. Aliquam erat volutpat. 
Nulla quis diam. Integer pellentesque quam vel velit. Nam libero tempore, 
cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod 
maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>`;

    // Define popup template.
    Object.assign(FroalaEditor.POPUP_TEMPLATES, {
        'searchAndReplacePlugin.popup': '[_CUSTOM_LAYER_][_BUTTONS_]'
    });

    // Define popup buttons.
    Object.assign(FroalaEditor.DEFAULTS, {
        popupButtons: ['popupClose', '|', /*'onlySearchButton', */'replaceFirstButton', 'replaceAllButton'],
    });

    FroalaEditor.PLUGINS.searchAndReplacePlugin = function (editor) {
        // Create custom popup.
        function initPopup () {
            // Load popup template.
            var template = FroalaEditor.POPUP_TEMPLATES.customPopup;
            if (typeof template == 'function') template = template.apply(editor);

            // Popup buttons.
            var popup_buttons = '';

            // Create the list of buttons.
            if (editor.opts.popupButtons.length > 1) {
                popup_buttons += '<div class="fr-buttons">';
                popup_buttons += editor.button.buildList(editor.opts.popupButtons);
                popup_buttons += '</div>';
            }

            // Load popup template.
            var template = {
                buttons: popup_buttons,
                custom_layer: `<div class="fr-layer fr-active">
                                <div class="fr-input-line">
                                <input id="fr-searchreplace-search-${editor.id}" type="text" placeholder="" tabindex="1" aria-required="true" dir="auto" class="">
                                <label for="fr-searchreplace-search-${editor.id}">Search</label>
                                </div>
                                <div class="fr-input-line">
                                <input id="fr-searchreplace-replace-${editor.id}" type="text" placeholder="" tabindex="2" aria-required="true" dir="auto" class="">
                                <label for="fr-searchreplace-replace-${editor.id}">Replace</label>
                                </div>
                            </div>`
            };


            // Create popup.
            var $popup = editor.popups.create('searchAndReplacePlugin.popup', template);

            return $popup;
        }

        // Show the popup
        function showPopup () {
            // Get the popup object defined above.
            var $popup = editor.popups.get('searchAndReplacePlugin.popup');

            // If popup doesn't exist then create it.
            // To improve performance it is best to create the popup when it is first needed
            // and not when the editor is initialized.
            if (!$popup) $popup = initPopup();

            // Set the editor toolbar as the popup's container.
            editor.popups.setContainer('searchAndReplacePlugin.popup', editor.$tb);

            // If the editor is not displayed when a toolbar button is pressed, then set BODY as the popup's container.
            // editor.popups.setContainer('searchAndReplacePlugin.popup', $('body'));

            // Trigger refresh for the popup.
            // editor.popups.refresh('searchAndReplacePlugin.popup');

            // This custom popup is opened by pressing a button from the editor's toolbar.
            // Get the button's object in order to place the popup relative to it.
            var $btn = editor.$tb.find('.fr-command[data-cmd="findAndReplaceButton"]');

            // Compute the popup's position.
            var left = $btn.offset().left + $btn.outerWidth() / 2;
            var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

            // Show the custom popup.
            // The button's outerHeight is required in case the popup needs to be displayed above it.
            editor.popups.show('searchAndReplacePlugin.popup', left, top, $btn.outerHeight());
        }

        // Hide the custom popup.
        function hidePopup () {
            editor.popups.hide('searchAndReplacePlugin.popup');
        }

        // Methods visible outside the plugin.
        return {
            showPopup: showPopup,
            hidePopup: hidePopup
        }
    }

    FroalaEditor.DefineIcon('findAndReplaceButton', { NAME: 'star', SVG_KEY: 'search'})
    FroalaEditor.RegisterCommand('findAndReplaceButton', {
        title: 'Find and replace',
        icon: 'findAndReplaceButton',
        undo: false,
        focus: false,
        popup: true,
        // Buttons which are included in the editor toolbar should have the plugin property set.
        plugin: 'searchAndReplacePlugin',
        callback: function () {
            if (!this.popups.isVisible('searchAndReplacePlugin.popup')) {
                this.searchAndReplacePlugin.showPopup();
            }
            else {
                if (this.$el.find('.fr-marker')) {
                    this.events.disableBlur();
                    this.selection.restore();
                }
                this.popups.hide('searchAndReplacePlugin.popup');
            }
        }
    });

    FroalaEditor.DefineIcon('popupClose', { NAME: 'times', SVG_KEY: 'close' });
    FroalaEditor.RegisterCommand('popupClose', {
        title: 'Close',
        undo: false,
        focus: false,
        callback: function () {
            this.searchAndReplacePlugin.hidePopup();
        }
    });

    /*FroalaEditor.DefineIcon('onlySearchButton', { NAME: 'replace', SVG_KEY: 'search' });
    FroalaEditor.RegisterCommand('onlySearchButton', {
        title: 'Only search',
        undo: true,
        focus: false,
        callback: function () {
            let search = document.getElementById('fr-searchreplace-search-' + this.id).value;
            if(!search || !search.length) {
                return;
            }

            let htmlEl = this.$el[0];
            let textContent = htmlEl.textContent;
            let textContentLength = htmlEl.textContent.length;

            let range = document.createRange();
            let selection = window.getSelection();

            range.setStart(htmlEl, 0);
            range.setEnd(htmlEl, 1);

        }
    });*/

    FroalaEditor.DefineIcon('replaceFirstButton', { NAME: 'replace', SVG_KEY: 'search' });
    FroalaEditor.RegisterCommand('replaceFirstButton', {
        title: 'Replace first',
        undo: true,
        focus: false,
        callback: function () {
            let search = document.getElementById('fr-searchreplace-search-' + this.id).value;
            if(!search || !search.length) {
                return;
            }
            let replace = document.getElementById('fr-searchreplace-replace-' + this.id).value;
            let html = this.html.get();
            html = html.replace(search, replace);
            this.html.set(html);
        }
    });

    FroalaEditor.DefineIcon('replaceAllButton',{ NAME: 'replace-all', SVG_KEY: 'search' });
    FroalaEditor.RegisterCommand('replaceAllButton', {
        title: 'Replace all',
        undo: true,
        focus: false,
        callback: function () {
            let search = document.getElementById('fr-searchreplace-search-' + this.id).value;
            if(!search || !search.length) {
                return;
            }
            let replace = document.getElementById('fr-searchreplace-replace-' + this.id).value;
            let html = this.html.get();
            html = html.replace(new RegExp(search, 'g'), replace);
            this.html.set(html);
            this.searchAndReplacePlugin.hidePopup();
        }
    });


    var froalaEditor = new FroalaEditor('#test_froala', {
        heightMin: 400,
        toolbarButtons: {
            'moreText': {
                'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting']
            },
            'moreParagraph': {
                'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote']
            },
            'moreRich': {
                'buttons': ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR']
            },
            'moreMisc': {
                'buttons': ['findAndReplaceButton', 'undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
                'align': 'right',
                'buttonsVisible': 1
            }
        }
    }, function() {
        this.html.set(defaultHtml);
    });

});