// Конвертер. 
function xml2json(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xml2json(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xml2json(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}

function fillCurrencies(data) {
    let wrappers = $('.currency__list');

    data.forEach((cur) => {
        let option = $('<option></option>')
            .text(cur.Name)
            .attr('data-rate', cur.VunitRate.replaceAll(',', '.'));

        wrappers.each((index, select) => {
            $(select).append(option.clone());
        });
    });
}

function calculate(evt) {
    let fromCur = $('.currency__list--from');
    let toCur = $('.currency__list--to');
    let from = $('.currency__result-input--from');
    let to = $('.currency__result-input--to');

    if ($(evt.currentTarget).hasClass('currency__result-input--from')) {
        let roubles = +from.val() * +fromCur.find('option:selected').data('rate');
        to.val((roubles / +toCur.find('option:selected').data('rate')).toFixed(2));
    } else {
        let roubles = +to.val() * +toCur.find('option:selected').data('rate');
        from.val((roubles / +fromCur.find('option:selected').data('rate')).toFixed(2));
    }
}

$(document).ready(function () {
    let slider = $('.main__slider').slick({
        slidesPerRow: 1,
        dots: true,
        arrows: false,
        autoplay: false,
        draggable: false,
        touchMove: false,
        swipe: false,
        infinite: false,
        adaptiveHeight: false,
    });

    $.ajax({
        url: 'https://www.cbr-xml-daily.ru/daily.xml',
        method: 'GET',
        dataType: 'text',
        success: function (response) {
            const decoder = new TextDecoder();
            const text = decoder.decode(new TextEncoder().encode(response));

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");

            const rates = xml2json(xmlDoc)['ValCurs']['Valute'];

            fillCurrencies(rates);
        },
        error: function (xhr, status, error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    });

    $('[data-step]').click(function (evt) {
        let targetSlide = $(this).data('step');
        let currentIndex = $('.main__slider').slick('slickCurrentSlide');
        let current = $(`[data-slick-index="${currentIndex}"]`);
        let requiredField = current.find("[required]");

        if (requiredField.length && !requiredField.val() && currentIndex < targetSlide) {
            return;
        }

        $('.main__slider').slick('slickGoTo', targetSlide);
    });

    $('.currency__result-input').on('keyup', calculate);
});