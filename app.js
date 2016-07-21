(function (angular) {
    'use strict';
    angular.module('ngApp', ['ngRoute'])

        .controller('MainController', function ($scope, $route, $routeParams, $location) {
            $scope.$route = $route;
            $scope.$location = $location;
            $scope.$routeParams = $routeParams;
        })

        .controller('AnalyticsController', ['$scope', 'Data', function ($scope, Data) {
            Array.prototype.getUnique = function(){
                var u = {}, a = [];
                for(var i = 0, l = this.length; i < l; ++i){
                    if(u.hasOwnProperty(this[i])) {
                        continue;
                    }
                    a.push(this[i]);
                    u[this[i]] = 1;
                }
                return a;
            };

            Data.getAnalyticsData().success(function (response) {
                $scope.analytics = response;

                $scope.chart1Data = [];
                $scope.chart1Labels = [];
                $scope.chart1DataSetLabel = [];
                $scope.chart1DataSetLabelColors = [];
                var data,
                    chart1Data = [];

                for (var i= 0; i < $scope.analytics.length; i++) {
                    data = $scope.analytics[i]['data'];
                    if (chart1Data[$scope.analytics[i]['zoneId']]) {
                        chart1Data[$scope.analytics[i]['zoneId']].push(data['speed']);
                    } else {
                        chart1Data[$scope.analytics[i]['zoneId']] = [];
                        chart1Data[$scope.analytics[i]['zoneId']].push(data['speed']);
                    }
                    $scope.chart1Labels.push(data['time']);
                    if (!$scope.chart1DataSetLabel[$scope.analytics[i]['zoneId']]) {
                        $scope.chart1DataSetLabel.push($scope.analytics[i]['zoneId']);
                    }
                    $scope.chart1DataSetLabel.push($scope.analytics[i]['zoneId']);
                    $scope.chart1DataSetLabelColors[$scope.analytics[i]['zoneId']] = $scope.analytics[i]['color'];
                }

                $scope.chart1Labels = $scope.chart1Labels.getUnique();
                $scope.chart1DataSetLabel = $scope.chart1DataSetLabel.getUnique();

                var chart1DataSet = [];
                for (var i= 0; i < $scope.chart1DataSetLabel.length; i++) {
                    chart1DataSet.push({
                        label: $scope.chart1DataSetLabel[i],
                        fill: false,
                        lineTension: 1,
                        borderColor: $scope.chart1DataSetLabelColors[$scope.chart1DataSetLabel[i]],
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 5,
                        pointHitRadius: 10,
                        data: chart1Data[$scope.chart1DataSetLabel[i]],
                        spanGaps: false,
                        options: {
                            responsive: true,
                            maintainAspectRatio:true
                        }
                    });
                }
                var ctx = document.getElementById("chart1");
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: $scope.chart1Labels,
                        datasets: chart1DataSet
                    }
                });

                ctx = document.getElementById("chart2");
                var chart2Data = [];

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: $scope.chart1DataSetLabel,
                        datasets: [chart1DataSet[0]]
                    }
                });

                ctx = document.getElementById("chart3");
                var chart3DataSet,
                    chart3DataSetAverage = [],
                    chart3DataSetColors = [],
                    dataAvg;
                for (var i= 0; i < $scope.chart1DataSetLabel.length; i++) {
                    data = chart1Data[$scope.chart1DataSetLabel[i]];
                    dataAvg = 0;
                    for (var j= 0; j < data.length; j++) {
                        dataAvg += data[j];
                    }
                    chart3DataSetAverage.push(dataAvg);
                    chart3DataSetColors.push($scope.chart1DataSetLabelColors[$scope.chart1DataSetLabel[i]]);
                }
                chart3DataSet = {
                    data: chart3DataSetAverage,
                    backgroundColor: chart3DataSetColors
                };
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: $scope.chart1DataSetLabel,
                        datasets: [
                            chart3DataSet
                        ]
                    }
                });
            });
        }])

        .controller('NewsController', ['$scope', 'Data', function ($scope, Data) {
            Data.getNewsData().success(function (response) {
                $scope.news = response;
                $scope.formatNewsData();
            });
            $scope.formatNewsData = function () {
                $scope.column1News = [];
                $scope.column2News = [];
                $scope.column3News = [];
                for (var i= 0; i < $scope.news.length; i++) {
                    if (i%3 == 0) {
                        $scope.column1News.push($scope.news[i]);
                    } else if (i%3 == 1) {
                        $scope.column2News.push($scope.news[i]);
                    } else if (i%3 == 2){
                        $scope.column3News.push($scope.news[i]);
                    }
                }
            }
        }])

        .controller('NavigationController', function ($scope, $routeParams) {
            $scope.navstatus = false;
            $scope.nav = '';

            $scope.collapseNav = function () {
                if ($scope.navstatus) {
                    $scope.nav = 'collapse';
                } else {
                    $scope.nav = '';
                }
                $scope.navstatus = !$scope.navstatus;
            };

            $scope.menu = [
                {
                    label:'Analytics',
                    iconCls:'fa-line-chart',
                    url:'#/analytics'
                },
                {
                    label:'News',
                    iconCls:'fa-newspaper-o',
                    url:'#/news'
                },
                {
                    label:'Board Brief',
                    iconCls:'fa-keyboard-o',
                    url:'#/board-brief'
                },
                {
                    label:'Briefcase',
                    iconCls:'fa-briefcase',
                    url:'#/briefcase'
                }
            ];

            $scope.collapseNav();
        })

        .factory('Data', ['$http', function ($http) {
            return {
                getNewsData:function () {
                    return $http.get('news-data.json');
                },
                getAnalyticsData:function () {
                    return $http.get('activity-data.json');
                }
            };
        }])

        .config(function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/analytics', {
                    templateUrl:'view/analytics.html',
                    controller:'AnalyticsController'
                })
                .when('/news', {
                    templateUrl:'view/news.html',
                    controller:'NewsController'
                });
        });

})(window.angular);