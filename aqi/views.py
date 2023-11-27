from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from . import aqi
# Create your views here.

# views.py
from django.http import JsonResponse

def getAQI(request):
    
    return render(request, 'index.html')

def demo(request):
    if request.method == 'POST':
        searchKey = request.POST.get("searchKey")
        data = aqi.getCityData(city_name=searchKey)
        return JsonResponse(data)