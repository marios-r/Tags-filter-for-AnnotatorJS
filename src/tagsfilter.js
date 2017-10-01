Annotator.Plugin.TagsFilter = function (element,options) {
	
	var plugin = {};
	
	plugin.pluginInit = function () {
		if(options){
			var el = ('element' in options)?options.element:element;
			this.options={
				element:('element' in options)?options.element:element,
				width:('width' in options)?options.width:'30%'
			};
		}else{
			this.options={element: element,width:'30%'};
		}
		this.annotator
          .subscribe("annotationsLoaded", function (clone) {
			  plugin._updateSelectTagsOptions(plugin._getTags());
          })
		  .subscribe("annotationCreated", plugin._onAnnotationCreated)
		  .subscribe("annotationUpdated", plugin._onAnnotationUpdated)
		  .subscribe("annotationDeleted", plugin._onAnnotationDeleted)
		  .subscribe('annotationViewerShown',plugin._onViewerShown);
		this._initializeSelectTags();
		plugin._updateSelectTagsOptions(plugin._getTags());
	};
  
	$.fn.select2.amd.define('select2/data/customAdapter',
		['select2/data/array', 'select2/utils'],
		function (ArrayAdapter, Utils) {
			function CustomDataAdapter ($element, options) {
				CustomDataAdapter.__super__.constructor.call(this, $element, options);
			}
			Utils.Extend(CustomDataAdapter, ArrayAdapter);
			CustomDataAdapter.prototype.updateOptions = function (data) {
				this.$element.find('option').remove(); 
				this.addOptions(this.convertToOptions(data));
			}        
			return CustomDataAdapter;
		}
	);

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
		.on('change',function(){
			plugin._applyTagFilters();
		});
	};

	plugin._applyTagFilters = function(){
		var tagFilters = $('#select-tag').val();
		filteredoutAnn = [];
		resultingAnn =[];
		$(".annotator-hl").each(function(){
			if(tagFilters){
				if(!plugin._checkIfFiltered($(this).data('annotation').tags,tagFilters)){
					$(this).addClass('annotator-hl-filtered');
					filteredoutAnn.push($(this).data('annotation'));
				}else{
					$(this).removeClass('annotator-hl-filtered');
					resultingAnn.push($(this).data('annotation'));
				}
			}else{
				$(this).removeClass('annotator-hl-filtered');
				resultingAnn.push($(this).data('annotation'));
			}
		});
		tagFilters=(tagFilters)?tagFilters:[];
		plugin.annotator.publish("onTagsFilterCheck", [filteredoutAnn,resultingAnn,tagFilters]);
	};
	
	plugin._getTags = function(){
		var _tags = [];
		$(".annotator-hl").each(function(){
			$.each($(this).data('annotation').tags,function(){
				_tags.push(this.toString());
			});
		});
		return $.unique(_tags);
	};
	
	plugin._updateSelectTagsOptions = function (tags){
		var selectedTags=$("#select-tag").val();
		var results = [];
		$.each(tags,function(index){
			results.push({ id: this, text: this});
		});
		$("#select-tag").data('select2').dataAdapter.updateOptions(results);
		if(selectedTags){
		$("#select-tag").val($.grep(selectedTags,function(value){return $.inArray(value,tags)>=0;}));
		//if(selectedTags!==$("#select-tag").val()){
			plugin._applyTagFilters();
		//}
		}
		if(tags.length==0){
			$("#select-tag").prop("disabled", true);
		}else{
			$("#select-tag").prop("disabled", false);
		}
	};
	

	plugin._checkIfFiltered = function(annotationTags,tagFilters){
		return $.grep(annotationTags,function(value){
			return $.inArray(value.toString(),tagFilters)>=0;
		}).length==tagFilters.length;
	};
	
	plugin._onAnnotationCreated = function (annotation){
		var tagFilters = $('#select-tag').val();
		var annotationTags = annotation.tags;
		if(tagFilters){
			if(tagFilters.length){
				if(!plugin._checkIfFiltered(annotationTags,tagFilters)){
					$(annotation.highlights).attr("class", "annotator-hl annotator-hl-filtered");

				}
			}
		}
		var prevTags=plugin._getTags();
		var tags = $.unique($.merge(prevTags,annotationTags));
		plugin._updateSelectTagsOptions(tags);
	};

	plugin._onAnnotationUpdated = function(annotation){
		var tagFilters = $('#select-tag').val();
		var annotationTags = annotation.tags;
		if(tagFilters){
			if(tagFilters.length){
				if(!plugin._checkIfFiltered(annotationTags,tagFilters)){
					$(annotation.highlights).attr("class", "annotator-hl annotator-hl-filtered");

				}
			}
		}
		var prevTags=plugin._getTags();
		var tags = $.unique($.merge(prevTags,annotationTags));
		plugin._updateSelectTagsOptions(tags);
	};
	
	plugin._onAnnotationDeleted = function(annotation){
		plugin._updateSelectTagsOptions(plugin._getTags());
	};
	
	plugin._onViewerShown = function(viewer, annotations){
		var tagFilters = $('#select-tag').val();
		if(tagFilters){
			var annotationsFilteredOut=true;
			$(viewer.element).find('.annotator-item').each(function(){
				var annotationTags = $(this).data('annotation').tags;
				if(typeof annotationTags !== 'undefined'){
					if(!plugin._checkIfFiltered(annotationTags,tagFilters)){
						$(this).hide();
					}
					else{
						annotationsFilteredOut = false;
					}
				}
			});
			if(annotationsFilteredOut){
				viewer.hide();
			}
		}
	};
	
	return plugin;
	
}