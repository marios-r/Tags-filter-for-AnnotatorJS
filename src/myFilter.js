Annotator.Plugin.MyFilter = function (element,options) {
	
	var plugin = {};
	
	plugin.pluginInit = function () {
		this._initializeActiveFiltersCounter();
		if(options){
			var el = ('element' in options)?options.element:element;
			this.options={
				element:('element' in options)?options.element:element,
				width:('width' in options)?options.width:'30%',
			};
		}else{
			this.options={element: element,width:'30%'};
		}
		this.annotator
          .subscribe("annotationsLoaded", function (clone) {
			  plugin._initializeActiveFiltersCounter();
			  plugin._updateSelectTagsData();
          })
		  .subscribe("annotationCreated", function(annotation){
			  $(annotation.highlights).data('active-filters',0);
			  var filterscount = 0;
			  var property=annotation.tags;
			  if($('#select-tag').val()){
				  for(var _i=0; _i< $('#select-tag').val().length; _i++){
					  if($.inArray($('#select-tag').val()[_i],annotation.tags)<0){
						filterscount+=1;
						$(annotation.highlights).attr("class", "annotator-hl annotator-hl-filtered");
						$(annotation.highlights).data('active-filters',filterscount);
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
						$(annotation.highlights).data('active-filters',filterscount);
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
		var tagsel='<select id="select-tag" multiple></select>';
		$(this.options.element).prepend(tagsel);
		$('#filter-wrapper').append(tagsel);
		var customAdapter = $.fn.select2.amd.require('select2/data/customAdapter');
		$("#select-tag").select2({
			width: this.options.width,
			placeholder: "Filter by tags",
			tags:false,
			dataAdapter: customAdapter,
			language: {
				noResults: function (params) {
					return "No matches found";
				}
			},
			allowClear: true
		})
		.on('select2:select', function(e){ plugin._onSelectTag(e.params.data.id);})
		.on('select2:unselect', function(e){ plugin._onUnselectTag(e.params.data.id);});
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
		$(".annotator-hl").each(
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
			newselectedTags=$.grep(selectedTags,function(value){
				return $.inArray(value,newdata)>=0;
			});
			$('#select-tag').val(newselectedTags);
		}
		$.each($.grep(selectedTags,function(value){
			return $.inArray(value,newselectedTags)<0;
		}),function(){plugin._onUnselectTag(this);});
	};
	
	//ON SELECT TAG
	plugin._onSelectTag = function(input){
		$(".annotator-hl").each(function(){
			var filterscount=$(this).data('active-filters');
			if(typeof $(this).data('annotation').tags!=='undefined'){
				var property = $(this).data('annotation').tags;
				if($.inArray(input,property)<0){
					$(this).addClass('annotator-hl-filtered');
					$(this).data('active-filters',filterscount+1);
				}
			}
			else{
				$(this).addClass('annotator-hl-filtered');
				$(this).data('active-filters',filterscount+1);
			}
		});
	};
	//ON UNSELECT TAG
	plugin._onUnselectTag = function(input){
		$(".annotator-hl").each(function(){
			var filterscount=$(this).data('active-filters');
			if(typeof $(this).data('annotation').tags!=='undefined'){
				var property = $(this).data('annotation').tags;
				if($.inArray(input,property)<0&&filterscount){
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
	}	

	return plugin;
}