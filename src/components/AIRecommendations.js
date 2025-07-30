import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

const AIRecommendations = () => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [preferences, setPreferences] = useState('');
  const [apiConfigured, setApiConfigured] = useState(false);

  // Check if API is configured on component mount
  useEffect(() => {
    const checkApiConfiguration = async () => {
      try {
        // Try to make a simple request to check if API is configured
        await aiAPI.getHealthRecommendations({ focus: 'general', preferences: '' });
        setApiConfigured(true);
      } catch (error) {
        // If error contains API configuration message, API is not configured
        if (error.response?.data?.message?.includes('AI service not configured')) {
          setApiConfigured(false);
        } else {
          // Other errors might mean API is configured but request failed for other reasons
          setApiConfigured(true);
        }
      }
    };
    checkApiConfiguration();
  }, []);

  const generateRecommendations = async (focus = 'general') => {
    setLoading(true);
    try {
      const response = await aiAPI.getHealthRecommendations({ focus, preferences });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Error generating recommendations. Please make sure your Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.generateMealPlan({ preferences, duration: 7 });
      setMealPlan(response.data);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Error generating meal plan. Please make sure your Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutPlan = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.generateWorkoutPlan({ 
        preferences, 
        duration: 7,
        equipment: ['bodyweight', 'dumbbells'] 
      });
      setWorkoutPlan(response.data);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      alert('Error generating workout plan. Please make sure your Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'recommendations', name: 'Health Tips' },
    { id: 'meals', name: 'Meal Plans' },
    { id: 'workouts', name: 'Workout Plans' },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Recommendations</h2>
        
        {/* Preferences Input */}
        <div className="mb-6">
          <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Preferences or Goals (Optional)
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="input"
            rows={3}
            placeholder="e.g., I want to lose weight, I'm vegetarian, I have limited time for workouts..."
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={() => generateRecommendations('general')}
                disabled={loading}
                className="btn btn-primary"
              >
                Get General Health Tips
              </button>
              <button
                onClick={() => generateRecommendations('nutrition')}
                disabled={loading}
                className="btn btn-secondary"
              >
                Nutrition Focus
              </button>
              <button
                onClick={() => generateRecommendations('fitness')}
                disabled={loading}
                className="btn btn-secondary"
              >
                Fitness Focus
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2">Generating personalized recommendations...</span>
              </div>
            )}

            {recommendations && (
              <div className="space-y-4">
                {recommendations.data && recommendations.data.recommendations ? (
                  Object.entries(recommendations.data.recommendations).map(([category, items]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </h4>
                      <ul className="space-y-1">
                        {Array.isArray(items) && items.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {recommendations.data?.rawResponse || 'No recommendations available.'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-4">
            <button
              onClick={generateMealPlan}
              disabled={loading}
              className="btn btn-primary"
            >
              Generate 7-Day Meal Plan
            </button>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2">Creating your personalized meal plan...</span>
              </div>
            )}

            {mealPlan && (
              <div className="space-y-4">
                {mealPlan.data && mealPlan.data.mealPlan ? (
                  Object.entries(mealPlan.data.mealPlan).map(([day, dayData]) => (
                    <div key={day} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">{dayData.date || day}</h4>
                      {dayData.meals && Object.entries(dayData.meals).map(([mealType, meal]) => (
                        <div key={mealType} className="mb-3">
                          <h5 className="font-medium text-sm text-gray-800 capitalize">{mealType}</h5>
                          {Array.isArray(meal) ? (
                            meal.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600 ml-2">
                                • {item.name} ({item.calories} cal)
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-600 ml-2">
                              • {meal.name} ({meal.calories} cal)
                            </div>
                          )}
                        </div>
                      ))}
                      {dayData.totalCalories && (
                        <div className="text-sm font-medium text-primary-600">
                          Total: {dayData.totalCalories} calories
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Your Meal Plan</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {mealPlan.data?.rawResponse || 'No meal plan available.'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="space-y-4">
            <button
              onClick={generateWorkoutPlan}
              disabled={loading}
              className="btn btn-primary"
            >
              Generate 7-Day Workout Plan
            </button>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2">Creating your personalized workout plan...</span>
              </div>
            )}

            {workoutPlan && (
              <div className="space-y-4">
                {workoutPlan.data && workoutPlan.data.workoutPlan ? (
                  Object.entries(workoutPlan.data.workoutPlan).map(([day, dayData]) => (
                    <div key={day} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {dayData.date || day} - {dayData.type}
                      </h4>
                      {dayData.duration && (
                        <div className="text-sm text-gray-600 mb-2">
                          Duration: {dayData.duration} minutes
                        </div>
                      )}
                      {dayData.mainWorkout && dayData.mainWorkout.map((exercise, index) => (
                        <div key={index} className="mb-2">
                          <div className="font-medium text-sm text-gray-800">
                            {exercise.name}
                          </div>
                          <div className="text-sm text-gray-600 ml-2">
                            {exercise.sets && `${exercise.sets} sets`}
                            {exercise.reps && ` × ${exercise.reps} reps`}
                            {exercise.rest && ` | Rest: ${exercise.rest}`}
                          </div>
                        </div>
                      ))}
                      {dayData.estimatedCalories && (
                        <div className="text-sm font-medium text-primary-600 mt-2">
                          Estimated calories burned: {dayData.estimatedCalories}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Your Workout Plan</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {workoutPlan.data?.rawResponse || 'No workout plan available.'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* API Configuration Notice - Only show if API is not configured */}
      {!apiConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                AI Features Configuration Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To use AI-powered recommendations, meal plans, and workout plans, you need to:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Get a Google Gemini API key from the Google AI Studio</li>
                  <li>Add it to your backend environment variables as GEMINI_API_KEY</li>
                  <li>Restart your backend server</li>
                </ol>
                <p className="mt-2">
                  Once configured, you'll get personalized recommendations based on your health profile!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Configuration Success - Show when API is configured */}
      {apiConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                AI Features Ready!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Your AI-powered recommendations are ready to use. Generate personalized meal plans, workout routines, and health recommendations below.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
