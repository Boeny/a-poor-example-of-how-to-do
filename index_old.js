$(document).ready(function(){
	/**
	 * Для всех элементов с class = toggle-cont
	 * Идет привязка события.
	 * Получая attr -> data-toggle мы  знаем кого это событие должно
	 */
	$('.toggle-cont').click(function(e){
		e.preventDefault();
		var t=$(this).attr('data-toggle');
		if ($('.'+t).length) {
			var h=($('.'+t).css('display')==='none');
			$('.'+t).toggle().trigger(h?'isVisible':'isHidden');
		}
	});

	$('.pricelist-options').on('isVisible',function(){
		$('i','.btn-pricelist-options').removeClass('fa-long-arrow-down').addClass('fa-long-arrow-up');
	});
	$('.pricelist-options').on('isHidden',function(){
		$('i','.btn-pricelist-options').removeClass('fa-long-arrow-up').addClass('fa-long-arrow-down');
	});

});

$(window).on('building_selected', function(){
	building = Cache.GetObject();
	window.id_building = building.id;//jQuery('#id_building').val() === undefined ? window.id_building : jQuery('#id_building').val();
	window.id_estate = jQuery('#id_estate').val() === undefined ? window.id_estate : jQuery('#id_estate').val();
	window.id_builder = jQuery('#tpl_id_builder').val() === undefined ? window.id_builder : jQuery('#tpl_id_builder').val();
	reloadImport();
});

function reloadImport(){
	$.ajax({
				type:'POST',
				url: '/realty/group/building/type/getImportView',
				data:'action=reload&RealtyDb_building='+window.id_building+'&RealtyDb_estate='+window.id_estate+'&RealtyDb_builder='+window.id_builder+'',
				dataType:'json',
				success:function(res){
					if (res.errors) {

					}
					$('.import').html(res);
					$('.import').show();
					slctImportFile();
				},
				complete:function(res){

				}
		});
}

function slctImportFile(){
	window.tpl_id = 0;
	window.id_estate = 0;
	window.id_building = 0;
	window.id_builder = 0;
	window.uploadedFile=false;
		window.replace = true;
		checkImportType = function(){
			 window.replace =($('#replace').is(':checked'));
			 console.log(window.replace);
				if(window.replace){
					$('#checkbox-label').text(' - с заменой всех данных');
				}else{
					$('#checkbox-label').text(' - добавление данных');
				}
		};
		checkImportType();
		var
	showNextBtn=function(){
		var checkFields=function(){
			if (window.fieldTypes) {
				var found=[];
				for (var i in window.fieldTypes) {
					var ft=window.fieldTypes[i];
					if (ft.type==1||ft.type==2) {
						if (found[i]===undefined) found[i]=0;
						if ($('option:selected[value="'+i+'"]','.group .preview .select select').length) {
							found[i]=1;
						}
						if (ft['link']&&$('option:selected[value="'+ft['link']+'"]','.group .preview .select select').length) {
							found[i]=1;
							found[ft['link']]=1;
						}
					}
				}
				for (var i in found) {
					if (!found[i]) return false;
				}
			}
			return true;
		};
		if (checkFields()&&jQuery('#tpl_id_builder').val()>0) {
			$('.group.preview-cont').addClass('border');
			$('.group.next-btn').show();
		} else {
			$('.group.preview-cont').removeClass('border');
			$('.group.next-btn').hide();
		}
	},
	loadValueExcel=function(column, obj){
		var form=$(obj).closest('form');
		//console.log(form.attr('action'));
		$.ajax({
				type:'POST',
				url:form.attr('action'),
				data:'action=loadValue&column='+column+'&file='+window.uploadedFile+'&'+form.serialize(),
				dataType:'json',
				success:function(res){
					if (res.errors) {

					}
				},
				complete:function(res){
					ob = jQuery(obj).parent().find('div').text(res.responseJSON.value);
				}
			});
	},
	fieldLabel_change=function(){
		loadValueExcel(jQuery(this).val(), this);
		cnt = 0;
		$('.group .preview .select select').each(function(i){
			var val=$(this).val();
			if(val != 0) cnt++;
		});
		if(cnt == 5 || cnt > 5){
			jQuery('.group.next-btn').show();
		}
	},
	echoErrors=function(errors){
		var errorsHtml='';
		for (var i=0,length=errors.length;i<length;i++) {
			errorsHtml+='<div>'+errors[i]+'</div>';
		}
		$('.errors').html(errorsHtml).show();
	},
	removeErrors=function(){
		$('.errors').html('').hide();
	},
	makePreview=function(){
		if (!window.uploadedFile) return;
		removeErrors();
		var form=$(this).closest('form');
		$('<div/>',{
			'class':'ajax-loading'
		}).appendTo('body');
		$.ajax({
			type:'POST',
			url:form.attr('action'),
			data:{
				action:'preview',
				file:window.uploadedFile,
				tpl:window.tpl
			},
			dataType:'json',
			success:function(data){
				if (data) {
					if (data.errors) {
						echoErrors(data.errors);
					}
					if (data.fieldTypes) {
						window.fieldTypes=data.fieldTypes;
					}
					if (data.preview) {
						$('.group .preview').html(data.preview);
						//fieldLabel_change();
						$('.group .preview .select select').off('change').change(fieldLabel_change);
					}
				}
			},
			complete:function(){
				$('.ajax-loading').remove();
			}
		});
	},
	applyGroupEvents=function(){
		$('.estate-dropdown').each(function(i){
			var n=$(this).attr('data-n');
			$(this).html($('#estate').parent().clone());
			$('select',this).attr('id','estate_'+n).attr('name','estate['+n+']').parent().show();
			$('select',$('.building-dropdown[data-n="'+n+'"]')).attr('id','building_'+n).attr('name','building['+n+']').parent().show();
		});
		$('.estate-dropdown select').change(function(){
			var n=$(this).parents('.estate-dropdown').attr('data-n');
			if ($('#building_'+$(this).val()).length) {
				$('.building-dropdown[data-n="'+n+'"]').html($('#building_'+$(this).val()).parent().clone());
			} else {
				$('.building-dropdown[data-n="'+n+'"]').html('');
			}
			$('select',$('.building-dropdown[data-n="'+n+'"]')).attr('id','building_'+n).attr('name','building['+n+']').parent().show();
		});
		$('.btn.btn-save').click(function(e){
			e.preventDefault();
			layout.showPreloader();
			layout.addPreloaderProcess('идет процесс', true);
			var form=$(this).closest('form');
			$('<div/>',{
				'class':'ajax-loading'
			}).appendTo('body');
			$.ajax({
				type:'POST',
				url:form.attr('action'),
				data:'action=save&file='+window.uploadedFile+'&tpl[id]='+window.tpl_id+'&replace='+window.replace+'&'+form.serialize(),
				dataType:'json',
				success:function(res){
					if (res.errors) {

					}
				},
				complete:function(res){
					layout.addPreloaderProcess('Загружено '+res.responseJSON.results+' объявлений', false);
					layout.hidePreloader();
					//layout.endPreloaderProcess();
					//layout.showPreloaderApprove();
				}
			});
		});
	};

	$('#tpl_id_builder').change(function(){
		makePreview();
	});

	$('#tpl_header_rows').change(function(){
		$(this).val(parseInt($(this).val())||1);
		window.tpl.header_rows=$(this).val();
		makePreview();
	});

	$('#tpl_title_row').change(function(){
		$(this).val(parseInt($(this).val())||1);
		window.tpl.title_row=$(this).val();
		makePreview();
	});

	$('#tpl_id_currency').change(function(){
		var val=$(this).val();
		window.tpl.id_currency=val;
		if (val==-1) {
			$('#tpl_currency_val').show();
		} else {
			$('#tpl_currency_val').hide();
		}
	});

	$('#tpl_currency_val').change(function(){
		window.tpl.currency_val=$(this).val();
	});

	$('.group.next-btn .btn').click(function(e){
		e.preventDefault();
		var form=$(this).closest('form');
		$('<div/>',{
			'class':'ajax-loading'
		}).appendTo('body');
		$.ajax({
			type:'POST',
			url:form.attr('action'),
			data:'action=compare&file='+window.uploadedFile+'&'+form.serialize(),
			dataType:'json',
			success:function(data){
				if (data.errors) {
				}
				if (data.html) {
					window.tpl_id = jQuery('#tpl_id').val();
					$('.import').html(data.html);
					$('.import').hide();
					saveImport();
					//applyGroupEvents();
				}
				if(data.template_id){
					//window.tpl.id = jQuery('#tpl_id').val();
					//jQuery('#tpl_id').val(data.template_id);
				}
			},
			complete:function(){
				$('.ajax-loading').remove();
			}
		});
	});

	$('#replace').on('click', function(){
		checkImportType();
	});

	$('input[type="file"]').change(function(e){
		e.preventDefault();
		removeErrors();
		var form=$(this).closest('form'),
		data=new FormData(),
		container=form,
		progress=$('progress',container),
		errors=[],
		countFiles=0;

		data.append('action','upload');
		data.append('tpl[id]',$('#tpl_id').val());
		data.append('tpl[id_builder]',$('#tpl_id_builder').val());
		data.append('tpl[id_currency]',$('#tpl_id_currency').val());
		data.append('tpl[currency_val]',$('#tpl_currency_val').val());
		data.append('tpl[header_rows]',$('#tpl_header_rows').val());
		data.append('tpl[title_row]',$('#tpl_title_row').val());
		data.append('tpl[max_file_size]',1000000);
		data.append('tpl[order]',1);

		window.id_estate = jQuery('#id_estate').val();
		window.id_building =  jQuery('#id_building').val();
		window.id_builder = $('#tpl_id_builder').val();

		$.each(this.files,function(i,file){
			data.append('file[]',file);
			countFiles++;
		});
		if (!countFiles) {
			errors.push('Файл не выбран.');
		}
		if (!errors.length) {
			progress.attr({
				'value':1,
				'max':100
			}).show();
			$('<div/>',{
				'class':'ajax-loading'
			}).appendTo('body');
			$.ajax({
				type:'POST',
				url:form.attr('action'),
				cache:false,
				contentType:false,
				processData:false,
				data:data,
				dataType:'json',
				xhr:function(){
					var req;
					try {
						req=new ActiveXObject('Msxml2.XMLHTTP');
					} catch(e) {
						try {
							req=new ActiveXObject('Microsoft.XMLHTTP');
						} catch(E) {
							req=false;
						}
					}
					if (!req&&typeof XMLHttpRequest!==undefined) req=new XMLHttpRequest();
					if (req.upload) req.upload.addEventListener('progress',function(e){
						if (e.lengthComputable) {
							$('progress',progress).attr({
								value:e.loaded,
								max:e.total
							});
						}
					});
					return req;
				},
				success:function(data){
					if (data) {
						if (data.errors) {
							echoErrors(data.errors);
						}
						if (data.fieldTypes) {
							window.fieldTypes=data.fieldTypes;
						}
						if (data.preview) {
							$('.group .preview').html(data.preview);
							//fieldLabel_change();
							$('.group .preview .select select').off('change').change(fieldLabel_change);
						}
						if (data.file) {
							window.uploadedFile=data.file;
						}
					}
				},
				complete:function(){
					$('.ajax-loading').remove();
					progress.hide();
					$('#file').val('');
					if (!window.uploadedFile) {
						echoErrors(['Ошибка загрузки файла.']);
					}
					cnt = 0;
					$('.group .preview .select select').each(function(i){
						var val=$(this).val();
						if(val != 0) cnt++;
					});
					if(cnt == 5 || cnt > 5){
						jQuery('.group.next-btn').show();
					}
				}
			});
		} else {
			echoErrors(errors);
		}
	});

	function reload(){
		$.ajax({
				type:'POST',
				url:'/realty/import',
				data:'action=reload&id_building='+window.id_building+'&id_estate='+window.id_estate+'&id_builder='+window.id_builder+'',
				dataType:'html',
				success:function(res){
					if (res.errors) {

					}
					$('.import').html(res);
					$('.import').show();
					slctImportFile();
				},
				complete:function(res){

				}
		});
	}

	function saveImport(){
			layout.showPreloader();
			layout.addPreloaderProcess('идет процесс', true);
			var form=$('.form-realty').closest('form');
			$('<div/>',{
				'class':'ajax-loading'
			}).appendTo('body');
			$.ajax({
				type:'POST',
				url:form.attr('action'),
				data:'action=save&file='+window.uploadedFile+'&tpl[id]=1&id_building='+window.id_building+'&id_estate='+window.id_estate+'&replace='+window.replace+'&'+form.serialize(),
				dataType:'json',
				success:function(res){
					if (res.errors) {

					}
				},
				complete:function(res){
					layout.addPreloaderProcess('Загружено '+res.responseJSON.results+' объявлений', false);
					layout.endPreloaderProcess();
					//layout.showPreloaderApprove(function(){location.reload()});
					layout.showPreloaderApprove();
					Cache.UpdateObject({need_to_fill: true}, true);// human
					edit_window.update();
				}
		});
	};
}
