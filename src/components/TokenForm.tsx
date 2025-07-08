import { useState } from 'react';

interface TokenFormProps {
  onSubmit: (tokenParams: TokenParameters) => void;
  isSubmitting: boolean;
}

export interface TokenParameters {
  name: string;
  symbol: string;
  initialSupply: string;
  taxPercentage: string;
  burnPercentage: string;
}

const TokenForm = ({ onSubmit, isSubmitting }: TokenFormProps) => {
  const [formData, setFormData] = useState<TokenParameters>({
    name: '',
    symbol: '',
    initialSupply: '1000000',
    taxPercentage: '2',
    burnPercentage: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Validate name
    if (!formData.name) {
      newErrors.name = 'Token name is required';
      isValid = false;
    } else if (formData.name.length > 50) {
      newErrors.name = 'Token name must be less than 50 characters';
      isValid = false;
    }
    
    // Validate symbol
    if (!formData.symbol) {
      newErrors.symbol = 'Token symbol is required';
      isValid = false;
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = 'Token symbol must be less than 10 characters';
      isValid = false;
    }
    
    // Validate initialSupply
    if (!formData.initialSupply) {
      newErrors.initialSupply = 'Initial supply is required';
      isValid = false;
    } else if (parseInt(formData.initialSupply) <= 0) {
      newErrors.initialSupply = 'Initial supply must be greater than 0';
      isValid = false;
    } else if (parseInt(formData.initialSupply) > 1000000000) {
      newErrors.initialSupply = 'Initial supply must be less than 1 billion';
      isValid = false;
    }
    
    // Validate taxPercentage
    if (!formData.taxPercentage) {
      newErrors.taxPercentage = 'Tax percentage is required';
      isValid = false;
    } else if (parseFloat(formData.taxPercentage) < 0) {
      newErrors.taxPercentage = 'Tax percentage cannot be negative';
      isValid = false;
    } else if (parseFloat(formData.taxPercentage) > 10) {
      newErrors.taxPercentage = 'Tax percentage must be 10% or less';
      isValid = false;
    }
    
    // Validate burnPercentage
    if (!formData.burnPercentage) {
      newErrors.burnPercentage = 'Burn percentage is required';
      isValid = false;
    } else if (parseFloat(formData.burnPercentage) < 0) {
      newErrors.burnPercentage = 'Burn percentage cannot be negative';
      isValid = false;
    } else if (parseFloat(formData.burnPercentage) > 10) {
      newErrors.burnPercentage = 'Burn percentage must be 10% or less';
      isValid = false;
    }
    
    // Check total fees
    const totalFees = parseFloat(formData.taxPercentage) + parseFloat(formData.burnPercentage);
    if (!isNaN(totalFees) && totalFees > 15) {
      newErrors.totalFees = 'Combined tax and burn percentage must be 15% or less';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configure Your Token</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Token Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. My Awesome Token"
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Token Symbol
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="e.g. MAT"
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.symbol ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
            required
            maxLength={10}
          />
          {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="initialSupply" className="block text-sm font-medium text-gray-700 mb-1">
          Initial Supply
        </label>
        <input
          type="number"
          id="initialSupply"
          name="initialSupply"
          value={formData.initialSupply}
          onChange={handleChange}
          placeholder="1000000"
          className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.initialSupply ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
          required
          min="1"
        />
        {errors.initialSupply && <p className="text-red-500 text-xs mt-1">{errors.initialSupply}</p>}
        <p className="text-xs text-gray-500 mt-1">
          The total number of tokens that will be created initially.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="taxPercentage" className="block text-sm font-medium text-gray-700 mb-1">
            Tax Percentage (%)
          </label>
          <input
            type="number"
            id="taxPercentage"
            name="taxPercentage"
            value={formData.taxPercentage}
            onChange={handleChange}
            placeholder="2"
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.taxPercentage ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
            required
            min="0"
            max="10"
            step="0.1"
          />
          {errors.taxPercentage && <p className="text-red-500 text-xs mt-1">{errors.taxPercentage}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Percentage of each transaction sent to the tax wallet.
          </p>
        </div>
        
        <div>
          <label htmlFor="burnPercentage" className="block text-sm font-medium text-gray-700 mb-1">
            Burn Percentage (%)
          </label>
          <input
            type="number"
            id="burnPercentage"
            name="burnPercentage"
            value={formData.burnPercentage}
            onChange={handleChange}
            placeholder="1"
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.burnPercentage ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
            required
            min="0"
            max="10"
            step="0.1"
          />
          {errors.burnPercentage && <p className="text-red-500 text-xs mt-1">{errors.burnPercentage}</p>}
          {errors.totalFees && <p className="text-red-500 text-xs mt-3">{errors.totalFees}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Percentage of each transaction that will be burned.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Deploying...' : 'Deploy Token'}
        </button>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Your token will be deployed on the Polygon Mumbai testnet. Transaction fees apply.
        </p>
      </div>
    </form>
  );
};

export default TokenForm;
