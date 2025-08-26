// Statistical Analysis Module for Performance Data
// Implements t-tests and ANOVA as per methodology section 4.9

class StatisticalAnalysis {
  constructor() {
    this.data = {
      direct: [],
      gateway: []
    };
  }

  // Calculate mean
  mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  // Calculate variance
  variance(arr) {
    const m = this.mean(arr);
    return arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
  }

  // Calculate standard deviation
  stdDev(arr) {
    return Math.sqrt(this.variance(arr));
  }

  // Perform two-sample t-test (comparing direct vs gateway)
  tTest(sample1, sample2) {
    const n1 = sample1.length;
    const n2 = sample2.length;
    const mean1 = this.mean(sample1);
    const mean2 = this.mean(sample2);
    const var1 = this.variance(sample1);
    const var2 = this.variance(sample2);
    
    // Pooled standard deviation
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const pooledStd = Math.sqrt(pooledVar);
    
    // t-statistic
    const tStat = (mean1 - mean2) / (pooledStd * Math.sqrt(1/n1 + 1/n2));
    
    // Degrees of freedom
    const df = n1 + n2 - 2;
    
    // Critical value for 95% confidence (two-tailed)
    const criticalValue = this.getCriticalValue(df);
    
    return {
      tStatistic: tStat,
      degreesOfFreedom: df,
      criticalValue: criticalValue,
      significant: Math.abs(tStat) > criticalValue,
      pValue: this.calculatePValue(tStat, df),
      mean1: mean1,
      mean2: mean2,
      difference: mean1 - mean2,
      confidenceInterval: this.calculateConfidenceInterval(mean1, mean2, pooledStd, n1, n2)
    };
  }

  // One-way ANOVA for comparing multiple device configurations
  anova(groups) {
    const k = groups.length; // Number of groups
    const N = groups.reduce((sum, group) => sum + group.length, 0); // Total observations
    const grandMean = this.mean(groups.flat());
    
    // Between-group sum of squares (SSB)
    let ssb = 0;
    groups.forEach(group => {
      const groupMean = this.mean(group);
      ssb += group.length * Math.pow(groupMean - grandMean, 2);
    });
    
    // Within-group sum of squares (SSW)
    let ssw = 0;
    groups.forEach(group => {
      const groupMean = this.mean(group);
      group.forEach(value => {
        ssw += Math.pow(value - groupMean, 2);
      });
    });
    
    // Degrees of freedom
    const dfBetween = k - 1;
    const dfWithin = N - k;
    
    // Mean squares
    const msBetween = ssb / dfBetween;
    const msWithin = ssw / dfWithin;
    
    // F-statistic
    const fStat = msBetween / msWithin;
    
    // Critical value for F-distribution (95% confidence)
    const criticalValue = this.getFCriticalValue(dfBetween, dfWithin);
    
    return {
      fStatistic: fStat,
      dfBetween: dfBetween,
      dfWithin: dfWithin,
      criticalValue: criticalValue,
      significant: fStat > criticalValue,
      pValue: this.calculateFPValue(fStat, dfBetween, dfWithin),
      meanSquareBetween: msBetween,
      meanSquareWithin: msWithin,
      groups: groups.map(g => ({
        mean: this.mean(g),
        stdDev: this.stdDev(g),
        n: g.length
      }))
    };
  }

  // Get critical t-value (approximation for 95% confidence)
  getCriticalValue(df) {
    // Simplified critical values for common df
    const criticalValues = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      10: 2.228, 20: 2.086, 30: 2.042, 50: 2.009, 100: 1.984
    };
    
    if (df in criticalValues) return criticalValues[df];
    if (df > 100) return 1.96;
    
    // Linear interpolation for other values
    const keys = Object.keys(criticalValues).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < keys.length - 1; i++) {
      if (df > keys[i] && df < keys[i + 1]) {
        const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
        return criticalValues[keys[i]] + 
               ratio * (criticalValues[keys[i + 1]] - criticalValues[keys[i]]);
      }
    }
    return 2.0;
  }

  // Get critical F-value (approximation for 95% confidence)
  getFCriticalValue(df1, df2) {
    // Simplified for common cases
    if (df1 === 2 && df2 >= 30) return 3.32;
    if (df1 === 3 && df2 >= 30) return 2.92;
    if (df1 === 4 && df2 >= 30) return 2.69;
    return 3.0; // Conservative estimate
  }

  // Calculate p-value approximation for t-test
  calculatePValue(tStat, df) {
    const absT = Math.abs(tStat);
    const critical = this.getCriticalValue(df);
    
    if (absT < critical) return "> 0.05";
    if (absT < critical * 1.5) return "< 0.05";
    if (absT < critical * 2) return "< 0.01";
    return "< 0.001";
  }

  // Calculate p-value approximation for F-test
  calculateFPValue(fStat, df1, df2) {
    const critical = this.getFCriticalValue(df1, df2);
    
    if (fStat < critical) return "> 0.05";
    if (fStat < critical * 1.5) return "< 0.05";
    if (fStat < critical * 2) return "< 0.01";
    return "< 0.001";
  }

  // Calculate confidence interval
  calculateConfidenceInterval(mean1, mean2, pooledStd, n1, n2) {
    const diff = mean1 - mean2;
    const se = pooledStd * Math.sqrt(1/n1 + 1/n2);
    const margin = 1.96 * se; // 95% confidence
    
    return {
      lower: diff - margin,
      upper: diff + margin
    };
  }

  // Generate statistical report
  generateReport(directData, gatewayData, deviceGroups) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        directMean: this.mean(directData),
        directStdDev: this.stdDev(directData),
        gatewayMean: gatewayData.length > 0 ? this.mean(gatewayData) : 0,
        gatewayStdDev: gatewayData.length > 0 ? this.stdDev(gatewayData) : 0
      },
      tTest: null,
      anova: null,
      conclusion: ''
    };

    // Perform t-test if have gateway data
    if (gatewayData.length > 0) {
      report.tTest = this.tTest(directData, gatewayData);
      
      if (report.tTest.significant) {
        report.conclusion += `Significant difference found between direct and gateway configurations (p ${report.tTest.pValue}). `;
        if (report.tTest.difference > 0) {
          report.conclusion += `Direct connection is ${Math.abs(report.tTest.difference).toFixed(2)}ms slower on average. `;
        } else {
          report.conclusion += `Gateway adds ${Math.abs(report.tTest.difference).toFixed(2)}ms latency on average. `;
        }
      } else {
        report.conclusion += `No significant difference between configurations (p ${report.tTest.pValue}). `;
      }
    }

    // Perform ANOVA ifmultiple device groups
    if (deviceGroups && deviceGroups.length > 2) {
      report.anova = this.anova(deviceGroups);
      
      if (report.anova.significant) {
        report.conclusion += `Significant variation found across device counts (F=${report.anova.fStatistic.toFixed(2)}, p ${report.anova.pValue}). `;
      } else {
        report.conclusion += `No significant variation across device counts (p ${report.anova.pValue}). `;
      }
    }

    return report;
  }
}

module.exports = StatisticalAnalysis;
