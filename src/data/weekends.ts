import type { Weekend } from '../types';

/**
 * Single source of truth for all FDD 2026 weekend content.
 * Extracted from "FDD 2026 master spreadsheet.xlsx" (Syllabus + Calendar sheets).
 *
 * To update content, edit the objects below. Each weekend has a Friday and a
 * Saturday schedule plus a `resources` list. Resource links are PLACEHOLDERS
 * (url: '#') — replace them with real URLs (slides, notebooks, recordings) when
 * available.
 */

/** Default placeholder resources shown until real links are added. */
const placeholderResources = (): Weekend['resources'] => [
  { label: 'Lecture slides — to be added', url: '#' },
  { label: 'Exercise notebooks — to be added', url: '#' },
];

export const weekends: Weekend[] = [
  {
    id: 'we0',
    number: 0,
    title: 'Python Programming for AI',
    theme: 'Preparatory crash course in the Python & ML toolkit',
    dates: '26–27 June 2026',
    startISO: '2026-06-26',
    category: 'optional',
    project: 'Nuclear Homework',
    summary:
      'An optional, hands-on warm-up weekend covering the practical Python stack used throughout the course: NumPy, scikit-learn, PyTorch, Pandas and visualization.',
    fridayRoom: 'HG D 1.1',
    friday: [
      {
        time: '08:00',
        title: 'Numpy Matrix and Vector Operations',
        type: 'lecture',
        who: 'Carlos',
        links: [
          {
            label: 'Slides',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/01_numpy-linalg-slides.pdf',
          },
          {
            label: 'Annotated',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/01_numpy-linalg-slides-annotated.pdf',
          },
        ],
      },
      {
        time: '09:00',
        title: 'Mini Recommender System',
        type: 'exercise',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/01_numpy_course_recommender_student_additional.ipynb',
      },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      {
        time: '10:30',
        title: 'Python Classes',
        type: 'lecture',
        who: 'Daniele',
        links: [
          { label: 'Slides', url: 'https://polybox.ethz.ch/index.php/s/qCfFoMN9YrjE2bi' },
        ],
      },
      {
        time: '11:00',
        title: 'Light Gradient Descent — Linear Regression',
        type: 'exercise',
        links: [
          {
            label: 'Part 1',
            url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/02a_python_classes_intro.ipynb',
          },
          {
            label: 'Part 2',
            url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/02b_OOP_light_gd_students.ipynb',
          },
        ],
      },
      {
        time: '12:00',
        title: 'Scikit-learn Machine Learning',
        type: 'lecture',
        who: 'Carlos',
        links: [
          {
            label: 'Slides',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/03_sklearn-slides.pdf',
          },
          {
            label: 'Annotated',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/03_sklearn-slides-annotated.pdf',
          },
        ],
      },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      {
        time: '14:00',
        title: 'Customer Churn Avoidance',
        type: 'exercise',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/03_sklearn_churn_prop_students.ipynb',
      },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      {
        time: '15:30',
        title: 'Types of Visualization + Dataframes (Pandas)',
        type: 'lecture',
        who: 'Adrian',
        links: [
          {
            label: 'Slides',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/04_Data%20and%20Visualization.pdf',
          },
        ],
      },
      {
        time: '16:00',
        title: 'Visualization',
        type: 'exercise',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/04_dataframes_and_visualizations_student.ipynb',
      },
    ],
    saturday: [
      {
        time: '08:00',
        title: 'PyTorch NNs, Tensors + NN Visualization',
        type: 'lecture',
        who: 'Dimitrios',
        links: [
          {
            label: 'Slides',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/05_intro_to_pytorch_p1.pdf',
          },
        ],
      },
      {
        time: '09:00',
        title: 'PyTorch Part 1',
        type: 'exercise',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/05_pytorch_tensors_nn_student.ipynb',
      },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      {
        time: '10:30',
        title: 'PyTorch Part 2: Specifics + Useful Libraries',
        type: 'lecture',
        who: 'Juan',
        links: [
          {
            label: 'Slides',
            url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/06_PyTorch_Part2.pdf',
          },
        ],
      },
      {
        time: '11:00',
        title: 'PyTorch Part 2',
        type: 'exercise',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/06_pytorch_training_hazards_student.ipynb',
      },
      {
        time: '12:00',
        title: 'Intro Exercise & Homework',
        type: 'project',
        who: 'Adrian',
        links: [
          { label: 'Repository', url: 'https://github.com/eth-fdd-fs26/FDD-WE0-public' },
          {
            label: 'Homework Part 1',
            url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/workshop/homework/HW1_pump_cleaning_fitting_student.ipynb',
          },
          {
            label: 'Homework Part 2',
            url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/workshop/homework/HW2_basin_temperature_student.ipynb',
          },
          {
            label: 'Homework Part 3',
            url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/workshop/homework/HW3_clustering_waste_student.ipynb',
          },
        ],
      },
    ],
    resources: [
      {
        group: 'Exercises',
        label: 'Block 1 — NumPy & Course Recommender (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/01_numpy_course_recommender_student_additional.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Block 2 — Python Classes, Part 1 (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/02a_python_classes_intro.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Block 2 — OOP & Light Gradient Descent, Part 2 (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/02b_OOP_light_gd_students.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Block 3 — scikit-learn Churn Prediction (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/03_sklearn_churn_prop_students.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Block 4 — Dataframes & Visualization (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/04_dataframes_and_visualizations_student.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Block 5 — PyTorch Tensors & NNs (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/05_pytorch_tensors_nn_student.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Block 6 — PyTorch Training Hazards (exercise, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/06_pytorch_training_hazards_student.ipynb',
      },
      {
        group: 'Exercises',
        label: 'Exercise repository — FDD-WE0-public (GitHub)',
        url: 'https://github.com/eth-fdd-fs26/FDD-WE0-public',
      },
      {
        group: 'Solutions',
        label: 'Block 1 — NumPy & Course Recommender (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/01_numpy_course_recommender_solution_additional.ipynb',
      },
      {
        group: 'Solutions',
        label: 'Block 2 — Python Classes, Part 1 (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/02a_python_classes_solution.ipynb',
      },
      {
        group: 'Solutions',
        label: 'Block 2 — OOP & Light Gradient Descent, Part 2 (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/02b_OOP_light_gd_solution.ipynb',
      },
      {
        group: 'Solutions',
        label: 'Block 3 — scikit-learn Churn Prediction (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/03_sklearn_churn_solution_prop.ipynb',
      },
      {
        group: 'Solutions',
        label: 'Block 4 — Dataframes & Visualization (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/04_dataframes_and_visualizations_solution.ipynb',
      },
      {
        group: 'Solutions',
        label: 'Block 5 — PyTorch Tensors & NNs (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/05_pytorch_tensors_nn_solution.ipynb',
      },
      {
        group: 'Solutions',
        label: 'Block 6 — PyTorch Training Hazards (solution, open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/exercises/solutions/06_pytorch_training_hazards_solution.ipynb',
      },
      {
        group: 'Lecture slides',
        label: 'Intro — lecture slides (PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/00_intro-slides.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'Python Classes — lecture slides (Daniele, PDF)',
        url: 'https://polybox.ethz.ch/index.php/s/qCfFoMN9YrjE2bi',
      },
      {
        group: 'Lecture slides',
        label: 'NumPy & Linear Algebra — lecture slides (Carlos, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/01_numpy-linalg-slides.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'NumPy & Linear Algebra, annotated lecture slides (Carlos, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/01_numpy-linalg-slides-annotated.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'scikit-learn — lecture slides (Carlos, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/03_sklearn-slides.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'scikit-learn, annotated lecture slides (Carlos, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/03_sklearn-slides-annotated.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'Data & Visualization — lecture slides (Adrian, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/04_Data%20and%20Visualization.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'Intro to PyTorch, Part 1 — lecture slides (Dimitrios, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/05_intro_to_pytorch_p1.pdf',
      },
      {
        group: 'Lecture slides',
        label: 'PyTorch, Part 2 — lecture slides (Juan, PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/06_PyTorch_Part2.pdf',
      },
      {
        group: 'Homework',
        label: 'Homework Part 1 — Pump Cleaning & Fitting (open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/workshop/homework/HW1_pump_cleaning_fitting_student.ipynb',
      },
      {
        group: 'Homework',
        label: 'Homework Part 2 — Basin Temperature (open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/workshop/homework/HW2_basin_temperature_student.ipynb',
      },
      {
        group: 'Homework',
        label: 'Homework Part 3 — Clustering Waste (open in Colab)',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE0-public/blob/main/workshop/homework/HW3_clustering_waste_student.ipynb',
      },
      {
        group: 'Homework',
        label: 'Homework Presentation — slides (PDF)',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/slides/Homework%20Presentation.pdf',
      },
      {
        group: 'Homework',
        label: 'Nuclear Central Manager Workshop — homework guide',
        url: 'https://raw.githubusercontent.com/eth-fdd-fs26/FDD-WE0-public/main/Nuclear_Central_Manager_Workshop.pdf',
      },
    ],
  },
  {
    id: 'we1',
    number: 1,
    title: 'Information Theory & Competitive ML',
    theme: 'Entropy, Gaussian processes, ensembles and Kaggle-style ML',
    dates: '10–11 July 2026',
    startISO: '2026-07-10',
    category: 'preparatory',
    project: 'Kaggle ML Competition',
    summary:
      'From the mathematical foundations of information theory and Gaussian processes to the practical craft of winning ML competitions with ensembles and strong preprocessing.',
    friday: [
      {
        time: '08:00',
        title: 'Gaussian Distributions & Gaussian Processes',
        type: 'lecture',
        who: 'Carlos',
        links: [
          { label: 'Roadmap', url: 'https://fdd-hs26.github.io/projects/w1-intro-roadmap-slides.pdf' },
          { label: 'Slides', url: 'https://fdd-hs26.github.io/projects/w1-gaussian-processes-slides.pdf' },
        ],
      },
      { 
        time: '09:00', 
        title: 'Gaussian Exercises', 
        type: 'exercise',
        links: [
          { label: 'Part 1: Gaussian Distributions', url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE1-public/blob/main/exercises/01a_cx_gaussian_distributions_student.ipynb'},
          { label: 'Part 2: Gaussian Process', url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE1-public/blob/main/exercises/01b_cx_gaussian_process_student.ipynb'},
        ],
      },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Information Theory — Entropy & Kullback–Leibler Divergence', type: 'lecture', who: 'Matina' },
      { time: '11:00', title: 'Information Theory', type: 'exercise' },
      {
        time: '12:00',
        title: 'IT Active Learning & Bayesian Optimization',
        type: 'lecture',
        who: 'Carlos',
        links: [
          { label: 'Slides', url: 'https://fdd-hs26.github.io/projects/w1-active-learning-slides.pdf' },
        ],
      },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'Info-theoretic Active Learning', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'Claude Code', type: 'lecture', who: 'Francesco, Deli' },
      { time: '16:00', title: 'Claude Code', type: 'exercise' },
    ],
    saturday: [
      { time: '08:00', title: 'Ensembles: XGBoost + Random Forests', type: 'lecture', who: 'Deli' },
      {
        time: '09:00',
        title: 'Ensembles',
        type: 'exercise',
        url: 'https://colab.research.google.com/github/eth-fdd-fs26/FDD-WE1-public/blob/main/exercises/05_cx_ensembles_student.ipynb',
      },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Kaggle + Competitive ML', type: 'lecture', who: 'Francesco' },
      { time: '11:00', title: 'Kaggle + Competitive ML (preprocessing, …)', type: 'exercise' },
      { time: '12:00', title: 'Intro to Project', type: 'project', who: 'Francesco' },
    ],
    resources: [
      {
        group: 'Setup',
        label: 'Installation guide — VS Code + Claude Code',
        url: 'guides/installation-guide.html',
      },
      { label: 'Lecture slides — to be added', url: '#' },
      { label: 'Exercise notebooks — to be added', url: '#' },
    ],
  },
  {
    id: 'we2',
    number: 2,
    title: 'Explainable AI & LLM Optimization',
    theme: 'Interpretability, attribution, robustness and prompt optimization',
    dates: '17–18 July 2026',
    startISO: '2026-07-17',
    category: 'preparatory',
    project: 'Project WE2',
    summary:
      'How to look inside models and make them better understood: LIME and SHAP attributions, mechanistic interpretability, robustness/certification, and modern prompt optimization with GEPA.',
    friday: [
      { time: '08:00', title: 'Re-intro to Neural Networks', type: 'lecture', who: 'Carlos' },
      { time: '09:00', title: 'Re-intro to NNs', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Confounding & Selection', type: 'lecture', who: 'Carlos' },
      { time: '11:00', title: 'Confounding & Selection', type: 'exercise' },
      { time: '12:00', title: 'LIME + Robustness / Certification', type: 'lecture', who: 'Ankita, Christina, Dimitrios' },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'LIME', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'Attribution Maps and SHAP', type: 'lecture', who: 'Giuseppe, Francesco' },
      { time: '16:00', title: 'SHAP', type: 'exercise' },
    ],
    saturday: [
      { time: '08:00', title: 'Mechanistic Interpretability', type: 'lecture', who: 'Adrian, Dimitrios' },
      { time: '09:00', title: 'Mechanistic Interpretability', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Prompt Optimization + GEPA', type: 'lecture', who: 'Emircan' },
      { time: '11:00', title: 'Prompt Optimization + GEPA', type: 'exercise' },
      { time: '12:00', title: 'Intro to Project', type: 'project', who: 'Adrian, Francesco' },
    ],
    resources: placeholderResources(),
  },
  {
    id: 'we3',
    number: 3,
    title: 'Security and AI',
    theme: 'Adversarial attacks, poisoning, jailbreaks and privacy',
    dates: '24–25 July 2026',
    startISO: '2026-07-24',
    category: 'preparatory',
    project: 'Project WE3',
    summary:
      'The offensive and defensive sides of AI security: adversarial attacks, data poisoning, LLM jailbreaking, agentic malware, differential privacy and watermarking.',
    friday: [
      { time: '08:00', title: 'Adversarial Attacks', type: 'lecture' },
      { time: '09:00', title: 'Adversarial Attacks', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Data Poisoning', type: 'lecture' },
      { time: '11:00', title: 'Data Poisoning', type: 'exercise' },
      { time: '12:00', title: 'Jailbreaking LLMs', type: 'lecture' },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'Jailbreaking LLMs', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'Differential Privacy', type: 'lecture' },
      { time: '16:00', title: 'Differential Privacy', type: 'exercise' },
    ],
    saturday: [
      { time: '08:00', title: 'Agentic AI for Malware', type: 'lecture' },
      { time: '09:00', title: 'Agentic AI for Malware', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'LLM Privacy and Watermarks', type: 'lecture' },
      { time: '11:00', title: 'Coding Exercise (TBD)', type: 'exercise' },
      { time: '12:00', title: 'Intro to Project', type: 'project' },
    ],
    resources: placeholderResources(),
  },
  {
    id: 'we4',
    number: 4,
    title: 'Modern Reinforcement Learning',
    theme: 'From REINFORCE to PPO',
    dates: '7–8 August 2026',
    startISO: '2026-08-07',
    category: 'preparatory',
    project: 'Project WE4',
    summary:
      'A modern tour of reinforcement learning: policy gradients with REINFORCE, generalized advantage estimation, and the PPO algorithm that powers much of today’s RL and RLHF.',
    friday: [
      { time: '08:00', title: 'Re-intro to RL', type: 'lecture' },
      { time: '09:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'REINFORCE', type: 'lecture' },
      { time: '11:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '12:00', title: 'GAE (Generalized Advantage Estimation)', type: 'lecture' },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'PPO', type: 'lecture' },
      { time: '16:00', title: 'Coding Exercise', type: 'exercise' },
    ],
    saturday: [
      { time: '08:00', title: 'Examples', type: 'lecture' },
      { time: '09:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'More Examples', type: 'lecture' },
      { time: '11:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '12:00', title: 'Intro to Project', type: 'project' },
    ],
    resources: placeholderResources(),
  },
  {
    id: 'we5',
    number: 5,
    title: 'Retrieval-Augmented Generation (RAG)',
    theme: 'Embeddings, vector search and RAG pipelines',
    dates: '14–15 August 2026',
    startISO: '2026-08-14',
    category: 'mandatory',
    project: 'Project RAG',
    summary:
      'Building retrieval systems end to end: clustering and embeddings, approximate nearest neighbour search with HNSW, spatial data structures, reranking and FAISS.',
    friday: [
      { time: '08:00', title: 'Clustering and K-means', type: 'lecture' },
      { time: '09:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Embeddings + RAG Pipeline', type: 'lecture' },
      { time: '11:00', title: 'RAG Pipeline', type: 'exercise' },
      { time: '12:00', title: 'ANN + HNSW', type: 'lecture' },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'Quadtrees and kd-trees', type: 'lecture' },
      { time: '16:00', title: 'Coding Exercise', type: 'exercise' },
    ],
    saturday: [
      { time: '08:00', title: 'Reranking & FAISS', type: 'lecture' },
      { time: '09:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Topic TBD', type: 'lecture' },
      { time: '11:00', title: 'Coding Exercise (TBD)', type: 'exercise' },
      { time: '12:00', title: 'Project', type: 'project' },
    ],
    resources: placeholderResources(),
  },
  {
    id: 'we6',
    number: 6,
    title: 'More Agentic AI',
    theme: 'Emergence, reasoning, and multi-agent systems',
    dates: '21–22 August 2026',
    startISO: '2026-08-21',
    category: 'mandatory',
    project: 'Project Agentic',
    summary:
      'Going deeper into agentic AI: emergent properties and reasoning in LLMs, mesa-optimization, Solomonoff induction, and multi-agent / meta-agentic systems.',
    friday: [
      { time: '08:00', title: 'Emergent Properties of LLMs', type: 'lecture' },
      { time: '09:00', title: 'Vapnik', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Mesa-optimization and Reasoning in LLMs', type: 'lecture' },
      { time: '11:00', title: 'Re-intro to LLMs', type: 'exercise' },
      { time: '12:00', title: 'Agentic AI', type: 'lecture' },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'Agentic AI', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'Intergalactic Football Tournament', type: 'project', who: 'Adrian & Loric' },
    ],
    saturday: [
      { time: '08:00', title: 'Solomonoff Induction', type: 'lecture' },
      { time: '09:00', title: 'Solomonoff Induction', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Multi-agentic and Meta-agentic AI', type: 'lecture' },
      { time: '11:00', title: 'Multi-agentic and Meta-agentic AI', type: 'exercise' },
      { time: '12:00', title: 'Project', type: 'project' },
    ],
    resources: placeholderResources(),
  },
  {
    id: 'we7',
    number: 7,
    title: 'Large-Scale AI',
    theme: 'Parallelism, distributed training and inference at scale',
    dates: '28–29 August 2026',
    startISO: '2026-08-28',
    category: 'mandatory',
    summary:
      'How modern AI is trained and served at scale: parallel computing, distributed training, efficient inference (quantization, batching), MLOps, and architectures like MoE and Flash Attention.',
    friday: [
      { time: '08:00', title: 'Parallel Computing', type: 'lecture' },
      { time: '09:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Distributed Training', type: 'lecture' },
      { time: '11:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '12:00', title: 'Inference at Scale (Quantization, Batching, …)', type: 'lecture' },
      { time: '13:00', title: 'Lunch break', type: 'break' },
      { time: '14:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '15:00', title: 'Coffee break', type: 'break' },
      { time: '15:30', title: 'MLOps', type: 'lecture' },
      { time: '16:00', title: 'Coding Exercise', type: 'exercise' },
    ],
    saturday: [
      { time: '08:00', title: 'Model Architectures for Scale (MoE, Flash Attention, Multimodal)', type: 'lecture' },
      { time: '09:00', title: 'Coding Exercise', type: 'exercise' },
      { time: '10:00', title: 'Coffee break', type: 'break' },
      { time: '10:30', title: 'Topic TBD', type: 'lecture' },
      { time: '11:00', title: 'Coding Exercise (TBD)', type: 'exercise' },
      { time: '12:00', title: 'Project', type: 'project' },
    ],
    resources: placeholderResources(),
  },
];

export const getWeekend = (id: string): Weekend | undefined =>
  weekends.find((w) => w.id === id);
