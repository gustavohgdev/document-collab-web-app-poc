import { calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from '../../utils/password';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password);
  const color = getPasswordStrengthColor(strength);
  const text = getPasswordStrengthText(strength);

  return (
    <div className="mt-1">
      <div className="flex justify-between mb-1">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-2 w-6 rounded-full ${
                index <= strength ? color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">{text}</span>
      </div>
      <div className="text-xs text-gray-500">
        Password must contain:
        <ul className="list-disc list-inside mt-1">
          <li className={password.length >= 8 ? 'text-green-600' : ''}>
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
            One uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
            One lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
            One number
          </li>
          <li className={/[$@#&!]/.test(password) ? 'text-green-600' : ''}>
            One special character ($@#&!)
          </li>
        </ul>
      </div>
    </div>
  );
}