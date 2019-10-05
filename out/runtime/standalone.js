/**
* AUTO-GENERATED - DO NOT EDIT. Source: https://github.com/gpuweb/cts
**/

import { TestLoader } from '../framework/loader.js';
import { Logger } from '../framework/logger.js';
import { makeQueryString } from '../framework/url_query.js';
const log = new Logger();
const runButtonCallbacks = new Map();
const resultsJSON = document.getElementById('resultsJSON');
const resultsVis = document.getElementById('resultsVis');

function makeTest(spec, description) {
  const test = $('<div>').addClass('test').appendTo(resultsVis);
  const testrun = $('<button>').addClass('testrun').html('&#9654;').appendTo(test);
  $('<div>').addClass('testname').text(makeQueryString(spec)).appendTo(test);
  $('<div>').addClass('testdesc').text(description).appendTo(test);
  const testcases = $('<div>').addClass('testcases').appendTo(test);
  testrun.on('click', async () => {
    for (const el of test.find('.caserun')) {
      const rc = runButtonCallbacks.get(el);
      await rc();
    }

    resultsJSON.textContent = log.asJSON(2);
  });
  return testcases[0];
}

function mkCase(testcasesVis, query, t, debug) {
  const testcase = $('<div>').addClass('testcase').appendTo(testcasesVis);
  const casehead = $('<div>').addClass('casehead').appendTo(testcase);
  const caserun = $('<button>').addClass('caserun').html('&#9654;').appendTo(casehead);
  $('<div>').addClass('casename').appendTo(casehead).text(query);
  const casetime = $('<div>').addClass('casetime').appendTo(casehead);
  const caselogs = $('<div>', {
    class: 'caselogs'
  }).appendTo(testcase);

  const runCase = async () => {
    const res = await t.run(debug);
    casetime.text(res.timems.toFixed(4) + ' ms');
    testcase.removeClass('pass');
    testcase.removeClass('warn');
    testcase.removeClass('fail');
    testcase.addClass(res.status);

    if (res.logs) {
      caselogs.empty();

      for (const l of res.logs) {
        $('<div>', {
          class: 'caselog'
        }).appendTo(caselogs).text(l);
      }
    }
  };

  runButtonCallbacks.set(caserun[0], runCase);
  caserun.on('click', async () => {
    await runCase();
    resultsJSON.textContent = log.asJSON(2);
  });
  return runCase;
}

(async () => {
  const url = new URL(window.location.toString());
  const runnow = url.searchParams.get('runnow') === '1';
  const debug = url.searchParams.get('debug') === '1';
  const loader = new TestLoader(); // TODO: everything after this point is very similar across the three runtimes.
  // TODO: start populating page before waiting for everything to load?

  const files = await loader.loadTestsFromQuery(window.location.search); // TODO: convert listing to tree so it can be displayed as a tree?

  const runCaseList = [];

  for (const f of files) {
    const testcasesVis = makeTest(f.id, f.spec.description);

    if (!('g' in f.spec)) {
      continue;
    }

    const [tRec] = log.record(f.id);

    for (const t of f.spec.g.iterate(tRec)) {
      const query = makeQueryString(f.id, t.id);
      const runCase = mkCase(testcasesVis, query, t, debug);
      runCaseList.push(runCase);
    }
  }

  if (runnow) {
    for (const runCase of runCaseList) {
      await runCase();
    }

    resultsJSON.textContent = log.asJSON(2);
  }
})();
//# sourceMappingURL=standalone.js.map