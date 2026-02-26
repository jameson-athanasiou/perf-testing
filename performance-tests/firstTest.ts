import http from 'k6/http';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';

// export const options = {
//   duration: '10s',
//   vus: 10
// };


// Sustained load test
// export const options = {
//   // Key configurations for Stress in this section
//   stages: [
//     { duration: '30s', target: 200 }, // traffic ramp-up from 1 to a higher 200 users over 10 minutes.
//     { duration: '30s', target: 200 }, // stay at higher 200 users for 30 minutes
//     { duration: '30s', target: 0 }, // ramp-down to 0 users
//   ],
// };

export const options = {
  // Key configurations for breakpoint in this section
  executor: 'ramping-arrival-rate', //Assure load increase if the system slows
  stages: [
    { duration: '2m', target: 2000 }, // just slowly ramp-up to a HUGE load
  ],
};

const errors: Record<string, Counter> = {
  '400': new Counter('errors_400'),
  '401': new Counter('errors_401'),
  '403': new Counter('errors_403'),
  '404': new Counter('errors_404'),
  '429': new Counter('errors_429'),
  '500': new Counter('errors_500'),
  '502': new Counter('errors_502'),
  '503': new Counter('errors_503'),
  'timeout': new Counter('errors_timeout'),
  'network': new Counter('errors_network'),
};

const setNewError = (response: http.RefinedResponse<http.ResponseType | undefined>) => {
  if (response.status === 0) {
    // Status 0 indicates network-level failure
    if (response.error.includes('timeout')) {
      errors['timeout'].add(1);
    } else {
      errors['network'].add(1);
    }
    console.error(`Network error: ${response.error}`);
  } else if (response.status >= 400) {
    const errorKey = response.status.toString();
    if (errors[errorKey]) {
      errors[errorKey].add(1);
    }
  }
}

export default function () {
  // Make a GET request to the target URL
  const response = http.get('http://localhost:3000/health');


  // Sleep for 1 second to simulate real-world usage
  sleep(1);

  setNewError(response);

  if (response.status !== 200) console.log(response.status)

}

export function teardown() {
    console.log('all tests complete');
    console.log(errors)
}