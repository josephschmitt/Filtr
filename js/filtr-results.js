Filtr.Results = Class.extend({
    /**
     * Init method
     * @param options (Object) - Options for the method.
     *  Eg.
     *  options: {
     *      //Maximum number of results to display
     *      maxResults: 5,
     *
     *      //Template to build out the results list based on the data
     *      tmpl: '',
     *
     *      select: function(winid, tabid) {
     *          //Method to handle what happens when an item is selected
     *      }
     *  }
     */
    init: function(element, options) {
        var self = this,
            items = element.querySelectorAll('li'),
            
            template = '<% for ( var i = 0; i < length; i++ ) { %>' + options.tmpl + '<% } %>',

            curSelection;

        self.element = element;


// PRIVATE METHODS ____________________________________________________________

        function updateLayout() {
            var height = 0;

            if (items.length > 0) {
                removeClass(element, 'invisible');

                for (var i = 0, length = items.length; i < length; i++) {
                    if (i < options.maxResults) {
                        height += items[i].clientHeight + 1;
                    }
                }

                element.style.maxHeight = height + 'px  !important';
            }
            else {
                addClass(element, 'invisible');
            }
        }

        function onItemSelect(e) {
            self.activateResult(e.target);
        }

        function onItemHover(e) {
            console.log(e);
            e.cancelBubble = true;

            var targ = e.target;
            //Hovering over child node
            if (!targ.tagName == 'LI') {
                targ = targ.parentNode;
            }
            self.selectResult(targ);
        }

        function onItemLeave(e) {
            e.cancelBubble = true;

            var targ = e.target;
            //Hovering over child node
            if (!targ.children.length) {
                targ = targ.parentNode;
            }

            self.deselectResult(targ);
        }


// PRIVILEGED METHODS _________________________________________________________

        self.refresh = function(data) {
            if (!data) {
                element.innerHTML = '';
            }
            else {
                element.innerHTML = tmpl(
                    template, {
                        results: data, 
                        length: Math.min(options.maxResults, data.length) || data.length
                    }
                );

                element.addEventListener('mouseover', onItemHover, false);
                element.addEventListener('mouseout', onItemLeave, false);
                element.addEventListener('click', onItemSelect, false);
                
                items = element.querySelectorAll('li');
                
                // for (var i = 0; i < items.length; i++) {
                //     items[i].addEventListener('mouseover', onItemHover, false);
                //     items[i].addEventListener('mouseout', onItemLeave, false);
                //     items[i].addEventListener('click', onItemSelect, false);
                // }
            }

            updateLayout();
            self.selectResult(items[0]);
        };

        self.selectResult = function(item) {
            if (!item) {return false;}
            
            if (curSelection) {
                self.deselectResult(curSelection);
            }

            addClass(item, 'active');
            self.curIndex = parseInt(item.getAttribute('data-index'));
            curSelection = items[self.curIndex];
        };

        self.deselectResult = function(item) {
            removeClass(item, 'active');
            curSelection = null;
            self.curIndex = null;
        };
        
        self.activateResult = function(item) {
            if (!item) {
                item = curSelection;
            }
            
            //Collect data-attributes into an object
            var itemData = {};
            for (var i=0, length = item.attributes.length, attr; i < length; i++) {
                attr = item.attributes[i];
                if (attr.name.indexOf('data-') == 0) {
                    itemData[attr.name.split('data-').join('')] = attr.value;
                }
            }
            
            //Pass data-attributes to select callback
            options.select.call(null, itemData);
        };

        self.destroy = function() {
            element.parentNode.removeChild(element);
        };
    }
});