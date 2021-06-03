$( document ).ready(function() {
    console.log('dom loaded');

    // Define popup template.
    Object.assign(FroalaEditor.POPUP_TEMPLATES, {
        'customPlugin.popup': '[_CUSTOM_LAYER_][_BUTTONS_]'
    });

    // Define popup buttons.
    Object.assign(FroalaEditor.DEFAULTS, {
        popupButtons: ['popupClose', '|', 'popupButton1', 'popupButton2'],
    });

    FroalaEditor.PLUGINS.customPlugin = function (editor) {
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
            var $popup = editor.popups.create('customPlugin.popup', template);

            return $popup;
        }

        // Show the popup
        function showPopup () {
            // Get the popup object defined above.
            var $popup = editor.popups.get('customPlugin.popup');

            // If popup doesn't exist then create it.
            // To improve performance it is best to create the popup when it is first needed
            // and not when the editor is initialized.
            if (!$popup) $popup = initPopup();

            // Set the editor toolbar as the popup's container.
            editor.popups.setContainer('customPlugin.popup', editor.$tb);

            // If the editor is not displayed when a toolbar button is pressed, then set BODY as the popup's container.
            // editor.popups.setContainer('customPlugin.popup', $('body'));

            // Trigger refresh for the popup.
            // editor.popups.refresh('customPlugin.popup');

            // This custom popup is opened by pressing a button from the editor's toolbar.
            // Get the button's object in order to place the popup relative to it.
            var $btn = editor.$tb.find('.fr-command[data-cmd="myButton"]');

            // Compute the popup's position.
            var left = $btn.offset().left + $btn.outerWidth() / 2;
            var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

            // Show the custom popup.
            // The button's outerHeight is required in case the popup needs to be displayed above it.
            editor.popups.show('customPlugin.popup', left, top, $btn.outerHeight());
        }

        // Hide the custom popup.
        function hidePopup () {
            editor.popups.hide('customPlugin.popup');
        }

        // Methods visible outside the plugin.
        return {
            showPopup: showPopup,
            hidePopup: hidePopup
        }
    }

    FroalaEditor.DefineIcon('buttonIcon', { NAME: 'star', SVG_KEY: 'search'})
    FroalaEditor.RegisterCommand('myButton', {
        title: 'Show Popup',
        icon: 'buttonIcon',
        undo: false,
        focus: false,
        popup: true,
        // Buttons which are included in the editor toolbar should have the plugin property set.
        plugin: 'customPlugin',
        callback: function () {
            if (!this.popups.isVisible('customPlugin.popup')) {
                this.customPlugin.showPopup();
            }
            else {
                if (this.$el.find('.fr-marker')) {
                    this.events.disableBlur();
                    this.selection.restore();
                }
                this.popups.hide('customPlugin.popup');
            }
        }
    });

    FroalaEditor.DefineIcon('popupClose', { NAME: 'times', SVG_KEY: 'close' });
    FroalaEditor.RegisterCommand('popupClose', {
        title: 'Close',
        undo: false,
        focus: false,
        callback: function () {
            this.customPlugin.hidePopup();
        }
    });

    FroalaEditor.DefineIcon('popupButton1', { NAME: 'replace', SVG_KEY: 'search' });
    FroalaEditor.RegisterCommand('popupButton1', {
        title: 'Replace first',
        undo: false,
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

    FroalaEditor.DefineIcon('popupButton2',{ NAME: 'replace-all', SVG_KEY: 'search' });
    FroalaEditor.RegisterCommand('popupButton2', {
        title: 'Replace all',
        undo: false,
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
            this.customPlugin.hidePopup();
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
                'buttons': ['myButton', 'undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
                'align': 'right',
                'buttonsVisible': 2
            }
        }
    });


});