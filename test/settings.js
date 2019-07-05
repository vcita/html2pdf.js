describe('html2pdf', function () {
  describe('settings', function () {
    describe('default settings', function () {
      var worker = html2pdf();
      var template = html2pdf.Worker.template;

      for (var key in template) {
        it(key + ' should begin with its default value', function () {
          // Use eql (a deep equal) to compare objects.
          expect(worker[key]).to.eql(template[key]);
        });
      }
    });

    // Sample settings to test with.
    var settings = {
      src: document.createElement('div'),
      container: document.createElement('div'),
      overlay: document.createElement('div'),
      canvas: document.createElement('canvas'),
      img: document.createElement('img'),
      pdf: 'REPLACE WITH NEW JSPDF',
      // Omitting pageSize because of unique behaviour.
      // pageSize: { 'width': 595.28, 'height': 841.89, 'unit': 'pt', 'k': 1 },
      filename: 'test.pdf',
      margin: [1,2,3,4],
      image: { type: 'png', quality: 1.0 },
      enableLinks: false,
      html2canvas: {test: 1},
      jsPDF: {test: 1},
      miscOpt: 1
    };

    describe('changing settings (batch)', function () {
      var worker = html2pdf().set(settings);
      for (var key in settings) {
        (function closure(key) {
          it(key + ' should be set to ' + settings[key], function () {
            return worker.get(key).then(function (val) {
              expect(val).to.eql(settings[key]);
            });
          });
        })(key);
      }
    });

    describe('changing settings (individual)', function () {
      var worker = html2pdf();
      for (var key in settings) {
        (function closure(key) {
          it(key + ' should be set to ' + settings[key], function () {
            var setting = {};
            setting[key] = settings[key];
            return worker.set(setting).get(key).then(function (val) {
              expect(val).to.eql(settings[key]);
            });
          });
        })(key);
      }
    });

    describe('changing margin', function () {
      var worker = html2pdf();
      it('setMargin should work with [1,1,1,1]', function () {
        return worker.setMargin([1,1,1,1]).get('margin').then(function (val) {
          expect(val).to.eql([1,1,1,1]);
        });
      });
      it('should convert [2,3] (w,h) to [2,3,2,3] (top,left,bottom,right)', function () {
        return worker.setMargin([2,3]).get('margin').then(function (val) {
          expect(val).to.eql([2,3,2,3]);
        });
      });
      it('should convert 4 (margin) to [4,4,4,4] (top,left,bottom,right)', function () {
        return worker.setMargin(4).get('margin').then(function (val) {
          expect(val).to.eql([4,4,4,4]);
        });
      });
    });

    describe('changing pageSize', function () {
      // NOTE: Currently setPageSize() should not be used externally, it's interdependent with the jsPDF setting.
      function makePageSize(unit, k, format, margin) {
        var pageSize = {unit: unit, k: k, width: format[0] / k, height: format[1] / k};
        pageSize.inner = {
          width:  pageSize.width - margin[1] - margin[3],
          height: pageSize.height - margin[0] - margin[2]
        };
        pageSize.inner.px = {
          width:  toPx(pageSize.inner.width, pageSize.k),
          height: toPx(pageSize.inner.height, pageSize.k)
        };
        pageSize.inner.ratio = pageSize.inner.height / pageSize.inner.width;
        return pageSize;
      }
      function toPx(val, k) {
        return Math.floor(val * k / 72 * 96);
      }

      var worker = html2pdf();
      it('setPageSize() with no argument should use jsPDF default settings', function () {
        return worker.setPageSize().get('pageSize').then(function (val) {
          var a4 = [595.28, 841.89];
          expect(val).to.eql(makePageSize('mm', 72 / 25.4, a4, this.opt.margin));
        });
      });
    });
  });
});