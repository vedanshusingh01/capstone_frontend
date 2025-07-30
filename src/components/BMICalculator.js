import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const BMICalculator = ({ onBMIUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    height: user?.height || '',
    weight: user?.weight || '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || '',
    });
  };

  const calculateBMI = async (e) => {
    e.preventDefault();
    
    if (!formData.height || !formData.weight) {
      alert('Please enter both height and weight');
      return;
    }

    setLoading(true);

    try {
      // Calculate BMI locally first
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);

      let category;
      if (bmi < 18.5) {
        category = 'Underweight';
      } else if (bmi < 25) {
        category = 'Normal weight';
      } else if (bmi < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }

      setResult({
        bmi: parseFloat(bmi),
        category,
        weight: formData.weight,
        height: formData.height,
      });

      // Update user profile if this is their current data
      if (user) {
        await userAPI.updateBMI({
          height: formData.height,
          weight: formData.weight,
        });
        
        if (onBMIUpdate) {
          onBMIUpdate(bmi);
        }
      }
    } catch (error) {
      console.error('Error calculating BMI:', error);
      alert('Error updating BMI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBMIBgColor = (bmi) => {
    if (bmi < 18.5) return 'bg-blue-50 border-blue-200';
    if (bmi < 25) return 'bg-green-50 border-green-200';
    if (bmi < 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">BMI Calculator</h2>
        
        <form onSubmit={calculateBMI} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                id="height"
                name="height"
                type="number"
                min="50"
                max="300"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                className="input"
                placeholder="Enter height in centimeters"
                required
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                className="input"
                placeholder="Enter weight in kilograms"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Calculating...' : 'Calculate BMI'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${getBMIBgColor(result.bmi)}`}>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getBMIColor(result.bmi)}`}>
                {result.bmi}
              </div>
              <div className={`text-lg font-medium mt-2 ${getBMIColor(result.bmi)}`}>
                {result.category}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Height: {result.height}cm | Weight: {result.weight}kg
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BMI Categories Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">BMI Categories</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
            <span className="font-medium text-blue-800">Underweight</span>
            <span className="text-blue-600">BMI less than 18.5</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
            <span className="font-medium text-green-800">Normal weight</span>
            <span className="text-green-600">BMI 18.5 - 24.9</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded">
            <span className="font-medium text-yellow-800">Overweight</span>
            <span className="text-yellow-600">BMI 25 - 29.9</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
            <span className="font-medium text-red-800">Obese</span>
            <span className="text-red-600">BMI 30 or greater</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
