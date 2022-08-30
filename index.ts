import {
  BehaviorSubject,
  concatMap,
  distinctUntilChanged,
  filter,
  from,
  fromEvent,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { map, debounceTime, tap } from 'rxjs/operators';

const obs = [];
// 1.
obs[0] = from([1, 2, 3, 4, 5]).pipe(
  map((num) => num + 1),
  filter((num) => num % 2 === 0)
);

// 2.
// document.getElementById('id'));
obs[1] = fromEvent(document.getElementById('input2'), 'keyup').pipe(
  debounceTime(300),
  map((event) => parseInt((event.target as HTMLInputElement)?.value) || 0),
  distinctUntilChanged(),
  switchMap((inputNum) => obs[0].pipe(map((num: number) => num + inputNum)))
);

// 3
//const input2Subject = new Subject<number>();
const input2Subject = new BehaviorSubject<number>(0);
// 將計算結果抽離出來，建立一個取得結果的Observable
obs[2] = input2Subject.pipe(
  switchMap((inputNum) => obs[0].pipe(map((num: number) => num + inputNum)))
);
// input2 keyup event
fromEvent(document.getElementById('input2'), 'keyup')
  .pipe(
    debounceTime(300),
    map((event) => parseInt((event.target as HTMLInputElement)?.value) || 0),
    distinctUntilChanged()
  )
  .subscribe(input2Subject); // 將input2Subject當作Observer，取得input2 keyup的結果

// input2 element subscribe
input2Subject
  .asObservable()
  .subscribe(
    (value) =>
      ((document.getElementById('input2') as HTMLInputElement).value =
        value.toString())
  );
// input2 control
fromEvent(document.querySelectorAll('[input2-ctrl]'), 'click')
  .pipe(map((e) => parseInt((e.target as HTMLElement).getAttribute('value'))))
  .subscribe((value) => {
    // behaviorSubject will store last data
    const num = input2Subject.value + value;
    input2Subject.next(num < 0 ? 0 : num);
  });

console.log('=========== Result ============');
if (obs.length > 0) {
  const resultObs = obs[obs.length - 1];
  resultObs.subscribe(console.log);
}
