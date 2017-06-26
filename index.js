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


$(document).ready(function(){

	//window.tpl=$.extend({},window.templatesList[0]);
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
				console.log(window.fieldTypes);
				var found=[];
				for (var i in window.fieldTypes) {
					var ft=window.fieldTypes[i];
					console.log(ft);
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
				console.log(found);
				for (var i in found) {
					if (!found[i]) return false;
				}
			}
			return true;
		};
		if (checkFields()&&window.tpl.id_builder>0) {
			$('.group.preview-cont').addClass('border');
			$('.group.next-btn').show();
		} else {
			$('.group.preview-cont').removeClass('border');
			$('.group.next-btn').hide();
		}
	},
	loadValueExcel=function(column, obj){
		var form=$(this).closest('form');
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
		//debugger;
		loadValueExcel(jQuery(this).val(), this);
		//console.log(jQuery(this).val());
		/*$('.group .preview .select select').each(function(i){
			var val=$(this).val();
			$(this).html($('#field_label_0').html()).val(val);
		});
		$('.group .preview .select select').each(function(i){
			var val=$(this).val();
			if (val&&window.fieldTypes&&window.fieldTypes[val]&&window.fieldTypes[val].type!=4) {
				$('option[value="'+val+'"]','.group .preview .select select:not(#field_label_'+(i+1)+')').remove();
			}
		});*/
		cnt = 0;
		$('.group .preview .select select').each(function(i){
			var val=$(this).val();
			if(val != 0) cnt++;
		});
		if(cnt == 3 || cnt > 3){
			jQuery('.group.next-btn').show();
		}
		//showNextBtn();
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
				data:'test='+$('.select-test').val()+'&action=save&file='+window.uploadedFile+'&tpl[id]='+window.tpl.id+'&replace='+window.replace+'&'+form.serialize(),
				dataType:'json',
				success:function(res){
					if (res.errors) {
							
					}
				},
				complete:function(res){
					layout.addPreloaderProcess('Загружено '+res.responseJSON.results+' объявлений', false);
					layout.endPreloaderProcess();
					layout.showPreloaderApprove(function(){location.reload()});
				}
			});
		});
		
		$('.btn.btn-check').click(function(e){
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
				data:'action=check&file='+window.uploadedFile+'&tpl[id]='+window.tpl.id+'&replace='+window.replace+'&'+form.serialize(),
				dataType:'json',
				success:function(res){
					if (res.errors) {
							
					}
				},
				complete:function(res){
					if(res.responseJSON.erros_files > 0){
						if(res.responseJSON.cnt_number_flat_0 > 0){
							layout.addPreloaderProcess('Номер квартиры отсутствует или 0: '+res.responseJSON.cnt_number_flat_0+' ', false);		
						}
						if(res.responseJSON.cnt_price_flat_min > 0){
							layout.addPreloaderProcess('Цена меньше 700 тыс. руб.: '+res.responseJSON.cnt_price_flat_min+' ', false);		
						}
						if(res.responseJSON.cnt_price_flat_max > 0){
							layout.addPreloaderProcess('Цена больше 500 млн. руб.: '+res.responseJSON.cnt_price_flat_max+' ', false);		
						}
						if(res.responseJSON.error_flat_standart > 0){
							layout.addPreloaderProcess('Не найдено квартир: '+res.responseJSON.error_flat_standart+' - ' + res.responseJSON.error_flat_standart_arr + '', false);
							layout.addPreloaderProcess('Для продолжения импорта создайте квартиры с указанными номерами', false);
						}
					}
					else{
						jQuery('.btn.btn-save').show();
					}
					layout.endPreloaderProcess();
					layout.showPreloaderApprove();
				}
			});
		});
	};

	$('#tpl_id_builder').change(function(){
		if (window.templatesList&&window.templatesList[$(this).val()]) {
			window.tpl=$.extend({},window.templatesList[$(this).val()]);
		} else {
			window.tpl=$.extend({},window.templatesList[0]);
			window.tpl.id_builder=$(this).val();
		}
		$('#tpl_id').val(window.tpl.id);
		$('#tpl_header_rows').val(window.tpl.header_rows);
		$('#tpl_title_row').val(window.tpl.title_row);
		$('#tpl_id_currency').val(window.tpl.id_currency).change();
		$('#tpl_currency_val').val(window.tpl.currency_val);
		if (window.tpl.id) {
			$('.pricelist-options').hide().trigger('isHidden');
		} else {
			$('.pricelist-options').show().trigger('isVisible');
		}
		if (!window.tpl.id_builder) {
			$('.pricelist-options').show().trigger('isVisible');
		}
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
					$('.layout-content').html(data.html);
					applyGroupEvents();
				}
				if(data.template_id){
					window.tpl.id = data.template_id;
					//jQuery('#tpl_id').val(data.template_id);
				}
			},
			complete:function(){
				$('.ajax-loading').remove();
			}
		});
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
		for (var i in window.tpl) {
			data.append('tpl['+i+']',window.tpl[i]);
		}
		$.each(this.files,function(i,file){
			/*if (file.size>window.tpl.maxFileSize) {
				errors.push('Размер файла "'+file.name+'" превышает максимально допустимый.');
				return;
			}*/
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
				}
			});
		} else {
			echoErrors(errors);
		}
	});

    $('#replace').on('click', function(){
	    checkImportType();     
    });
       
});