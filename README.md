## Tags-filter-for-AnnotatorJS
### Tags filter with select2 for annotatorjs.

#### Install

Include jQuery, Select2 and AnnotatorJS with Tags plugin:
<pre>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js" ></script> 
<link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/css/select2.min.css" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min.js"></script>
<script src="https://rawgit.com/Marios-R/Tags-filter-for-AnnotatorJS/master/annotator.1.2.10/annotator.min.js"></script>
<link href="https://rawgit.com/Marios-R/Tags-filter-for-AnnotatorJS/master/annotator.1.2.10/annotator.min.css" rel="stylesheet" />
<script src="https://rawgit.com/Marios-R/Tags-filter-for-AnnotatorJS/master/annotator.1.2.10/annotator.tags.min.js"></script>
<script src="https://rawgit.com/Marios-R/Tags-filter-for-AnnotatorJS/master/src/myFilter.js"></script>
</pre>

#### Options

**element** 
The element to prepend the select-box. It's a jQuery selector. 
default = the element you initialized Annotator on
**width** 
The width of the select-box 
default = '30%'

### Events
**tagSelected(annotations)** 
Called when a tag has been selected and the respective filter have been applied
**tagUnselected(annotations)**
Called when a tag has been unselected and the respective filter has been removed
#### Online Examples

[##### Example 1](https://marios-r.github.io/Tags-filter-for-AnnotatorJS/docs/example1)
<pre>
var annotation = $('#main_content').annotator();
annotation.annotator('addPlugin', 'Tags');
annotation.annotator('addPlugin', 'TagsFilter');
</pre>

[##### Example 2](https://marios-r.github.io/Tags-filter-for-AnnotatorJS/docs/example2)
<pre>
var annotation = $('#main_content').annotator();
annotation.annotator('addPlugin', 'Tags');
annotation.annotator('addPlugin', 'TagsFilter',{element: 'body', width: "500px"; multiple: true});
</pre>


