// "test" allowes us to define individual test case.

// test('This is my first jest', () => {
    
// });

// test('Andrews challenge', () => {
    
// });

import { getFirstName, isValidPassword } from '../src/utils/user';

test('should return first name when given full name', () => {
    const firstName = getFirstName('Mike Hyashi');
    // IMPORTANT!!!!
    // if run throw error, jest think it has an error
    // throw new Error('This should trigger a failure.')

    // (old one)
    // if(firstName !== 'Mike') throw new Error('This should trigger a failure.');
    
    // By using expect..
    expect(firstName).toBe('Mike');
});

test('shold return first name when given the first name', () => {
    const firstName = getFirstName('Jan');
    expect(firstName).toBe('Jan');
});

test('shold reject password shorter than 8 letters', () => {
    const password = isValidPassword('abcd');
    expect(password).toBe(false);
});

test('shold reject password does not include password word', () => {
    const password = isValidPassword('aafcgafadfasdf');
    expect(password).toBe(false);
});