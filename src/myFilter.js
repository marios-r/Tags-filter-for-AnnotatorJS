Annotator.Plugin.MyFilter = function (element,options) {
	var plugin = {};
	
	plugin.pluginInit = function () {
		this._initializeActiveFiltersCounter();


		

		if(options){
			var el = ('element' in options)?options.element:element;
			this.options={
				element:('element' in options)?options.element:element,
				width:('width' in options)?options.width:'30%',
				multiple:('multiple' in options)?options.multiple:true,
			};
		}else{
			this.options={element: element,width:'30%',multiple:true};
		}


		//$(this.annotator.element).prepend($(filterwrapper));
		this.annotator
          .subscribe("annotationsLoaded", function (clone) {
			  plugin._initializeActiveFiltersCounter();
			  plugin._updateSelectTagsData();
          })
		  .subscribe("annotationCreated", function(annotation){
			  $(annotation.highlights).data('active-filters',0);
			  var filterscount = 0;
			  var property=annotation.tags;
			  console.log(annotation.tags);
			  console.log($('#select-tag').val());
			  if($('#select-tag').val()){
				  for(var _i=0; _i< $('#select-tag').val().length; _i++){
					  console.log($.inArray($('#select-tag').val()[_i],annotation.tags));
					  if($.inArray($('#select-tag').val()[_i],annotation.tags)<0){
						filterscount+=1;
						$(annotation.highlights).attr("class", "annotator-hl annotator-hl-filtered");
						$(this).data('active-filters',filterscount);
						console.log($(this).data('active-filters'));
					}
				  }
			  }
			  plugin._updateSelectTagsData();
		  })
		  .subscribe("annotationUpdated", function(annotation){
			  var property=annotation.tags;
			  var filterscount = $(annotation.highlights).data('active-filters');
			  if($('#select-tag').val()){
				  for(var _i=0; _i< $('#select-tag').val().length; _i++){
					if($.inArray($('#select-tag').val()[_i],annotation.tags)<0){
						filterscount+=1;
						$(annotation.highlights).attr("class", "annotator-hl annotator-hl-filtered");
						$(this).data('active-filters',filterscount);
					} 
				  }
			  }
			  plugin._updateSelectTagsData();
		  })
		  .subscribe("annotationDeleted", function(annotation){
			  plugin._updateSelectTagsData();
		  })
		  .subscribe('annotationViewerShown',function(viewer, annotations){
			  var annotationsFilteredOut=true;
			  for(var i=0;i<annotations.length;i++){
				  if(!$(annotations[0].highlights).data('active-filters')){
					annotationsFilteredOut=false;
				  }
			  }
			  if(annotationsFilteredOut){
				viewer.hide();
			  }
		  })
		  .subscribe("annotationViewerTextField", function(field, annotation){
			  console.log(field);
			  console.log(annotation);
				console.log($(annotation.highlights).data('active-filters'));
				if($(annotation.highlights).data('active-filters'))
					$(field).html('');
		  })
		  .subscribe("rangeNormalizeFail", function(annotation, r, e){
			  console.log(annotation);
			  console.log(r);
			  console.log(e);
		  })
		this._initializeSelectTags();
	};
  
	//TAGS DATA
	$.fn.select2.amd.define('select2/data/customAdapter',
		['select2/data/array', 'select2/utils'],
		function (ArrayAdapter, Utils) {
			function CustomDataAdapter ($element, options) {
				CustomDataAdapter.__super__.constructor.call(this, $element, options);
			}
			Utils.Extend(CustomDataAdapter, ArrayAdapter);
			CustomDataAdapter.prototype.updateOptions = function (data) {
				this.$element.find('option').remove(); // remove all options
				this.addOptions(this.convertToOptions(data));
			}        
			return CustomDataAdapter;
		}
	);
	//INITIALIZE SELECT2 FOR TAGS
	plugin._initializeSelectTags = function() {
		var filterwrapper='<div id="filter-wrapper"></div>';
		$(this.options.element).prepend(filterwrapper);
		var tagsel=(this.options.multiple)?'<select id="select-tag" multiple></select>':'<select id="select-tag"></select>';
		$('#filter-wrapper').append(tagsel);
		//var customDropdownAdapter=$.fn.select2.amd.require('select2/dropdown/customAdapter');
		var customAdapter = $.fn.select2.amd.require('select2/data/customAdapter');
		$("#select-tag").select2({
			width: this.options.width,
			//dropdownAdapter : customDropdownAdapter,
			placeholder: "Filter by tags",
			tags:false,
			dataAdapter: customAdapter,
			language: {
				noResults: function (params) {
					return "No matches found";
				}
			}
		})
		.on('select2:select', this._onSelectTag)
		.on('select2:unselect', this._onUnselectTag);
	};
	//COUNTER FOR ACTIVE FILTERS ON EACH ANNOTATION
	plugin._initializeActiveFiltersCounter = function(){
		$(".annotator-hl").each(function(){
			$(this).data('active-filters',0);
		});
	};
	//OPENING TAGS DROPDOWN
	plugin._updateSelectTagsData = function(event) {
		var selectedTags = $('#select-tag').val();
		var results = [];
		var newdata=[];
		$(".annotator-hl:visible").each(
			function(index){
				if(typeof $(this).data('annotation').tags!=='undefined'){
					for (i = 0; i < $(this).data('annotation').tags.length; i++) { 
						newdata.push($(this).data('annotation').tags[i]);
					}
				}
			}
		);
		newdata=$.unique(newdata);
		$.each(newdata,function(index){
			results.push({ id: this, text: this});
		});
		$("#select-tag").data('select2').dataAdapter.updateOptions(results);
		if(selectedTags){
			selectedTags=$.grep(selectedTags,function(value){
				return $.inArray(value,newdata);
			});
			$('#select-tag').val(selectedTags);
		}
	};
	//CHECK IF FILTER APPLIES TO ANNOTATION
	plugin._isFiltered = function (input, tags) {
        if (input && tags && tags.length) {
          var keywords = input.split(/\s+/g);
          for (var i = 0; i < keywords.length; i += 1) {
            for (var j = 0; j < tags.length; j += 1) {
              if (tags[j]==keywords[i]) {
                return true;
              }
            }
          }
        }
        return false;
    };
	//ON SELECT TAG
	plugin._onSelectTag = function(e){
		var input = e.params.data.id;
		console.log(input);
		$(".annotator-hl").each(function(){
			var filterscount=$(this).data('active-filters');
			if(typeof $(this).data('annotation').tags!=='undefined'){
				var property = $(this).data('annotation').tags;
				if(!plugin._isFiltered(input,property)){
					$(this).addClass('annotator-hl-filtered');
					$(this).data('active-filters',filterscount+1);
				}
			}
			else{
				$(this).addClass('annotator-hl-filtered');
				$(this).data('active-filters',filterscount+1);
			}
		});
		$(".annotator-hl").each(function(){
			console.log($(this).data('active-filters'));
		});
	};
	//ON UNSELECT TAG
	plugin._onUnselectTag = function(e){
		var input = e.params.data.id;
		$(".annotator-hl").each(function(){
			var filterscount=$(this).data('active-filters');
			if(typeof $(this).data('annotation').tags!=='undefined'){
				var property = $(this).data('annotation').tags;
				
				if(!plugin._isFiltered(input,property)&&filterscount){
					$(this).data('active-filters',filterscount-1);
					if(!$(this).data('active-filters')){
						$(this).removeClass('annotator-hl-filtered');
					}
				}
			}
			else{
				$(this).data('active-filters',filterscount-1);
				if(!$(this).data('active-filters')){
					$(this).removeClass('annotator-hl-filtered');
				}
			}
		});
		$(".annotator-hl").each(function(){
			console.log($(this).data('active-filters'));
		});		
	}	


	return plugin;
}